const Medicine = require("../models/Medicine");
const Pharmacy = require("../models/Pharmacy");
const distanceKmFn = require("../utils/distance");

// GET /api/search/medicines?q=paracetamol&category=&verifiedOnly=&availableOnly=&lat=&lng=&maxDistanceKm=&sort=distance|name
const searchMedicines = async (req, res, next) => {
  try {
    const {
      q,
      category,
      verifiedOnly,
      availableOnly,
      lat,
      lng,
      maxDistanceKm,
      sort,
    } = req.query;

    const medicineFilter = {};
    if (q) {
      medicineFilter.$or = [
        { name: { $regex: q, $options: "i" } },
        { genericName: { $regex: q, $options: "i" } },
      ];
    }
    if (category) medicineFilter.category = { $regex: `^${category}$`, $options: "i" };

    const medicines = await Medicine.find(medicineFilter).populate("pharmacy");

    const userLat = lat !== undefined ? parseFloat(lat) : undefined;
    const userLng = lng !== undefined ? parseFloat(lng) : undefined;
    const maxDist = maxDistanceKm ? parseFloat(maxDistanceKm) : null;

    let results = medicines
      .filter((m) => m.pharmacy && m.pharmacy.isActive)
      .map((m) => {
        const pharmacy = m.pharmacy;
        const dist =
          userLat !== undefined && userLng !== undefined
            ? distanceKmFn(userLat, userLng, pharmacy.location.lat, pharmacy.location.lng)
            : null;

        return {
          medicineId: m._id,
          name: m.name,
          genericName: m.genericName,
          category: m.category,
          strength: m.strength,
          form: m.form,
          price: m.price,
          quantityAvailable: m.quantity,
          isAvailable: !m.manuallyUnavailable && m.expiryDate > new Date() && m.quantity > 0,
          isLowStock: m.quantity > 0 && m.quantity <= m.lowStockThreshold,
          pharmacyId: pharmacy._id,
          pharmacyName: pharmacy.pharmacyName,
          pharmacyVerified: pharmacy.verificationStatus === "APPROVED",
          pharmacyAddress: pharmacy.address,
          pharmacyPhone: pharmacy.phone,
          isOpenNow: pharmacy.isCurrentlyOpen(),
          distanceKm: dist,
        };
      });

    if (verifiedOnly === "true") results = results.filter((r) => r.pharmacyVerified);
    if (availableOnly === "true") results = results.filter((r) => r.isAvailable);
    if (maxDist) results = results.filter((r) => r.distanceKm !== null && r.distanceKm <= maxDist);

    if (sort === "distance") {
      results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    } else if (sort === "name") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // default: available first, then distance
      results.sort((a, b) => {
        if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
        return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
      });
    }

    res.json({ results, count: results.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/search/nearby?lat=&lng=&maxDistanceKm=
const searchNearbyPharmacies = async (req, res, next) => {
  try {
    const { lat, lng, maxDistanceKm } = req.query;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "lat and lng are required." });
    }
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxDist = maxDistanceKm ? parseFloat(maxDistanceKm) : null;

    const pharmacies = await Pharmacy.find({ isActive: true, verificationStatus: "APPROVED" });
    let results = pharmacies.map((p) => ({
      id: p._id,
      pharmacyName: p.pharmacyName,
      address: p.address,
      phone: p.phone,
      distanceKm: distanceKmFn(userLat, userLng, p.location.lat, p.location.lng),
      isOpenNow: p.isCurrentlyOpen(),
    }));
    if (maxDist) results = results.filter((r) => r.distanceKm !== null && r.distanceKm <= maxDist);
    results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

    res.json({ pharmacies: results });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchMedicines, searchNearbyPharmacies };
