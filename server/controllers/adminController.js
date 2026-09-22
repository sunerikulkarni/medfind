const User = require("../models/User");
const Pharmacy = require("../models/Pharmacy");
const Medicine = require("../models/Medicine");
const MedicineRequest = require("../models/MedicineRequest");
const { notify } = require("./notificationController");

// GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalPharmacies,
      verifiedPharmacies,
      pendingPharmacies,
      totalMedicines,
      activeRequests,
      completedRequests,
    ] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      Pharmacy.countDocuments(),
      Pharmacy.countDocuments({ verificationStatus: "APPROVED" }),
      Pharmacy.countDocuments({ verificationStatus: "PENDING" }),
      Medicine.countDocuments(),
      MedicineRequest.countDocuments({ status: { $in: ["PENDING", "CONFIRMED"] } }),
      MedicineRequest.countDocuments({ status: "COMPLETED" }),
    ]);

    res.json({
      totalUsers,
      totalPharmacies,
      verifiedPharmacies,
      pendingPharmacies,
      totalMedicines,
      activeRequests,
      completedRequests,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/pharmacies/pending
const getPendingPharmacies = async (req, res, next) => {
  try {
    const pharmacies = await Pharmacy.find({ verificationStatus: "PENDING" }).sort({
      createdAt: -1,
    });
    res.json({ pharmacies });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/pharmacies/:id/approve
const approvePharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: "Pharmacy not found." });
    pharmacy.verificationStatus = "APPROVED";
    pharmacy.rejectionReason = undefined;
    await pharmacy.save();
    await notify({
      recipientType: "Pharmacy",
      recipient: pharmacy._id,
      title: "Pharmacy approved",
      message: "Your pharmacy has been verified and is now visible to patients.",
    });
    res.json({ pharmacy });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/pharmacies/:id/reject   body: { reason }
const rejectPharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: "Pharmacy not found." });
    pharmacy.verificationStatus = "REJECTED";
    pharmacy.rejectionReason = req.body.reason || "Did not meet verification requirements.";
    await pharmacy.save();
    await notify({
      recipientType: "Pharmacy",
      recipient: pharmacy._id,
      title: "Pharmacy registration rejected",
      message: pharmacy.rejectionReason,
    });
    res.json({ pharmacy });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/pharmacies/:id/suspend
const suspendPharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: "Pharmacy not found." });
    pharmacy.verificationStatus = "SUSPENDED";
    pharmacy.isActive = false;
    await pharmacy.save();
    res.json({ pharmacy });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "patient" }).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/pharmacies
const getAllPharmacies = async (req, res, next) => {
  try {
    const pharmacies = await Pharmacy.find().sort({ createdAt: -1 });
    res.json({ pharmacies });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/requests
const getAllRequests = async (req, res, next) => {
  try {
    const requests = await MedicineRequest.find()
      .populate("medicine", "name")
      .populate("pharmacy", "pharmacyName")
      .populate("user", "fullName")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ requests });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/medicines/:id  (remove inappropriate inventory entry)
const removeMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found." });
    await medicine.deleteOne();
    res.json({ message: "Medicine entry removed." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getPendingPharmacies,
  approvePharmacy,
  rejectPharmacy,
  suspendPharmacy,
  getUsers,
  getAllPharmacies,
  getAllRequests,
  removeMedicine,
};
