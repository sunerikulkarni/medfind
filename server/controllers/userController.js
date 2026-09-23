const bcrypt = require("bcryptjs");
const User = require("../models/User");

const sanitize = (doc) => {
  const obj = doc.toObject();
  delete obj.passwordHash;
  return obj;
};

// GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patient accounts have this profile type." });
    }
    const user = await User.findById(req.user.id).populate(
      "savedPharmacies",
      "pharmacyName address phone verificationStatus location operatingHours"
    );
    res.json({ user: sanitize(user) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, address, lat, lng, password } = req.body;
    const user = await User.findById(req.user.id);

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (lat !== undefined && lng !== undefined) user.location = { lat, lng };
    if (password) user.passwordHash = await bcrypt.hash(password, 10);

    await user.save();
    res.json({ user: sanitize(user) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/saved-pharmacies/:pharmacyId  (toggle save)
const toggleSavedPharmacy = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const { pharmacyId } = req.params;
    const idx = user.savedPharmacies.findIndex((p) => p.toString() === pharmacyId);
    if (idx >= 0) {
      user.savedPharmacies.splice(idx, 1);
    } else {
      user.savedPharmacies.push(pharmacyId);
    }
    await user.save();
    res.json({ savedPharmacies: user.savedPharmacies });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, toggleSavedPharmacy };
