const mongoose = require("mongoose");
const MedicineRequest = require("../models/MedicineRequest");
const Medicine = require("../models/Medicine");
const { notify } = require("./notificationController");

// POST /api/requests  (patient only)
const createRequest = async (req, res, next) => {
  try {
    const { pharmacyId, medicineId, quantityRequested, note, urgency } = req.body;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine || medicine.pharmacy.toString() !== pharmacyId) {
      return res.status(404).json({ message: "No matching stock was found." });
    }
    if (medicine.manuallyUnavailable || medicine.expiryDate < new Date()) {
      return res.status(400).json({ message: "This medicine is not currently available." });
    }
    if (quantityRequested > medicine.quantity) {
      return res.status(400).json({
        message: `Only ${medicine.quantity} unit(s) available. Please request a smaller quantity or contact a pharmacist.`,
      });
    }

    const request = await MedicineRequest.create({
      user: req.user.id,
      pharmacy: pharmacyId,
      medicine: medicineId,
      quantityRequested,
      note,
      urgency: urgency === "URGENT" ? "URGENT" : "NORMAL",
      status: "PENDING",
    });

    await notify({
      recipientType: "Pharmacy",
      recipient: pharmacyId,
      title: "New medicine request",
      message: `${req.user.doc.fullName} requested ${quantityRequested} unit(s) of ${medicine.name}.`,
      relatedRequest: request._id,
    });

    await notify({
      recipientType: "User",
      recipient: req.user.id,
      title: "Request submitted",
      message: `Your request for ${medicine.name} has been submitted and is pending confirmation.`,
      relatedRequest: request._id,
    });

    res.status(201).json({ request });
  } catch (err) {
    next(err);
  }
};

// GET /api/requests  (role-aware: patient sees own, pharmacy sees own incoming)
const listRequests = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "pharmacy" ? { pharmacy: req.user.id } : { user: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const requests = await MedicineRequest.find(filter)
      .populate("medicine")
      .populate("pharmacy", "pharmacyName address phone verificationStatus")
      .populate("user", "fullName phone")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    next(err);
  }
};

// GET /api/requests/:id
const getRequest = async (req, res, next) => {
  try {
    const request = await MedicineRequest.findById(req.params.id)
      .populate("medicine")
      .populate("pharmacy", "pharmacyName address phone")
      .populate("user", "fullName phone");
    if (!request) return res.status(404).json({ message: "Request not found." });

    const owns =
      (req.user.role === "pharmacy" && request.pharmacy._id.toString() === req.user.id) ||
      (req.user.role !== "pharmacy" && request.user._id.toString() === req.user.id);
    if (!owns && req.user.role !== "admin") {
      return res.status(403).json({ message: "You do not have access to this request." });
    }

    res.json({ request });
  } catch (err) {
    next(err);
  }
};

// PUT /api/requests/:id/status   body: { status, reason }
// Valid transitions:
//   pharmacy: PENDING -> CONFIRMED | REJECTED ; CONFIRMED -> COMPLETED
//   patient:  PENDING | CONFIRMED -> CANCELLED
const updateStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { status, reason } = req.body;
    const request = await MedicineRequest.findById(req.params.id).session(session);
    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Request not found." });
    }

    const isPharmacy = req.user.role === "pharmacy" && request.pharmacy.toString() === req.user.id;
    const isPatient = req.user.role === "patient" && request.user.toString() === req.user.id;

    if (!isPharmacy && !isPatient) {
      await session.abortTransaction();
      return res.status(403).json({ message: "You do not have access to this request." });
    }

    const transitions = {
      pharmacy: {
        PENDING: ["CONFIRMED", "REJECTED"],
        CONFIRMED: ["COMPLETED"],
      },
      patient: {
        PENDING: ["CANCELLED"],
        CONFIRMED: ["CANCELLED"],
      },
    };
    const actorRole = isPharmacy ? "pharmacy" : "patient";
    const allowed = transitions[actorRole][request.status] || [];
    if (!allowed.includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Cannot change status from ${request.status} to ${status} as ${actorRole}.`,
      });
    }

    // Only deduct inventory when a request is marked COMPLETED (fulfilled).
    if (status === "COMPLETED") {
      const medicine = await Medicine.findById(request.medicine).session(session);
      if (!medicine || medicine.quantity < request.quantityRequested) {
        await session.abortTransaction();
        return res.status(409).json({
          message: "Stock has changed and is no longer sufficient to complete this request.",
        });
      }
      medicine.quantity -= request.quantityRequested;
      await medicine.save({ session });
    }

    request.status = status;
    if (reason) request.statusReason = reason;
    await request.save({ session });

    await session.commitTransaction();

    // Populated after the transaction commits so it never touches the
    // session/transaction path above — read-only, no effect on stock logic.
    await request.populate("medicine", "name");
    const medicineName = request.medicine?.name || "your medicine";

    const notifMap = {
      CONFIRMED: `Your request for ${medicineName} was confirmed by the pharmacy.`,
      REJECTED: `Your request for ${medicineName} was rejected by the pharmacy.`,
      COMPLETED: `Your request for ${medicineName} has been completed.`,
      CANCELLED: `The request for ${medicineName} was cancelled.`,
    };
    const recipientType = isPharmacy ? "User" : "Pharmacy";
    const recipient = isPharmacy ? request.user : request.pharmacy;
    await notify({
      recipientType,
      recipient,
      title: `Request ${status.toLowerCase()}`,
      message: notifMap[status] || `Request status changed to ${status}.`,
      relatedRequest: request._id,
    });

    res.json({ request });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// DELETE /api/requests/:id  (patient cancels a still-pending request)
const cancelRequest = async (req, res, next) => {
  try {
    const request = await MedicineRequest.findById(req.params.id).populate("medicine", "name");
    if (!request) return res.status(404).json({ message: "Request not found." });
    if (request.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only cancel your own requests." });
    }
    if (!["PENDING", "CONFIRMED"].includes(request.status)) {
      return res.status(400).json({ message: "This request can no longer be cancelled." });
    }
    request.status = "CANCELLED";
    await request.save();

    await notify({
      recipientType: "Pharmacy",
      recipient: request.pharmacy,
      title: "Request cancelled",
      message: `The request for ${request.medicine?.name || "a medicine"} was cancelled by the patient.`,
      relatedRequest: request._id,
    });

    res.json({ request });
  } catch (err) {
    next(err);
  }
};

module.exports = { createRequest, listRequests, getRequest, updateStatus, cancelRequest };
