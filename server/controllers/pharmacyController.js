const bcrypt = require("bcryptjs");
const Pharmacy = require("../models/Pharmacy");
const Medicine = require("../models/Medicine");
const distanceKm = require("../utils/distance");

const sanitize = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj.passwordHash;
  return obj;
};

// GET /api/pharmacies  (public directory, supports ?verifiedOnly=true)
const listPharmacies = async (req, res, next) => {
  try {
    const { verifiedOnly } = req.query;
    const filter = { isActive: true };
    if (verifiedOnly === "true") filter.verificationStatus = "APPROVED";

    const pharmacies = await Pharmacy.find(filter).sort({ createdAt: -1 });
    res.json({ pharmacies: pharmacies.map(sanitize) });
  } catch (err) {
    next(err);
  }
};

// GET /api/pharmacies/nearby?lat=&lng=&maxDistanceKm=
const nearbyPharmacies = async (req, res, next) => {
  try {
    const { lat, lng, maxDistanceKm } = req.query;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "lat and lng query parameters are required." });
    }
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxDist = maxDistanceKm ? parseFloat(maxDistanceKm) : null;

    const pharmacies = await Pharmacy.find({
      isActive: true,
      verificationStatus: "APPROVED",
    });

    let results = pharmacies.map((p) => {
      const obj = sanitize(p);
      obj.distanceKm = distanceKm(userLat, userLng, p.location.lat, p.location.lng);
      obj.isOpenNow = p.isCurrentlyOpen();
      return obj;
    });

    if (maxDist) results = results.filter((p) => p.distanceKm !== null && p.distanceKm <= maxDist);
    results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

    res.json({ pharmacies: results });
  } catch (err) {
    next(err);
  }
};

// GET /api/pharmacies/:id
const getPharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy || !pharmacy.isActive) {
      return res.status(404).json({ message: "Pharmacy not found." });
    }
    const medicines = await Medicine.find({ pharmacy: pharmacy._id });
    res.json({ pharmacy: { ...sanitize(pharmacy), isOpenNow: pharmacy.isCurrentlyOpen() }, medicines });
  } catch (err) {
    next(err);
  }
};

// PUT /api/pharmacies/:id  (pharmacy self-update only)
const updatePharmacy = async (req, res, next) => {
  try {
    if (req.user.role !== "pharmacy" || req.user.id !== req.params.id) {
      return res.status(403).json({ message: "You can only update your own pharmacy profile." });
    }
    const { pharmacyName, phone, address, lat, lng, operatingHours, password } = req.body;
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (pharmacyName) pharmacy.pharmacyName = pharmacyName;
    if (phone) pharmacy.phone = phone;
    if (address) pharmacy.address = address;
    if (lat !== undefined && lng !== undefined) pharmacy.location = { lat, lng };
    if (operatingHours) pharmacy.operatingHours = operatingHours;
    if (password) pharmacy.passwordHash = await bcrypt.hash(password, 10);

    await pharmacy.save();
    res.json({ pharmacy: sanitize(pharmacy) });
  } catch (err) {
    next(err);
  }
};

// GET /api/pharmacies/me/dashboard  (pharmacy's own stats)
const getDashboardStats = async (req, res, next) => {
  try {
    const pharmacyId = req.user.id;
    const medicines = await Medicine.find({ pharmacy: pharmacyId });
    const MedicineRequest = require("../models/MedicineRequest");
    const requests = await MedicineRequest.find({ pharmacy: pharmacyId });

    const totalMedicines = medicines.length;
    const availableMedicines = medicines.filter(
      (m) => !m.manuallyUnavailable && m.expiryDate > new Date() && m.quantity > 0
    ).length;
    const lowStock = medicines.filter(
      (m) => m.quantity > 0 && m.quantity <= m.lowStockThreshold
    ).length;
    const pendingRequests = requests.filter((r) => r.status === "PENDING").length;
    const completedRequests = requests.filter((r) => r.status === "COMPLETED").length;

    res.json({
      totalMedicines,
      availableMedicines,
      lowStock,
      pendingRequests,
      completedRequests,
      verificationStatus: req.user.doc.verificationStatus,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPharmacies,
  nearbyPharmacies,
  getPharmacy,
  updatePharmacy,
  getDashboardStats,
};
