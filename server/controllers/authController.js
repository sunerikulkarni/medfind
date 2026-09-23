const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Pharmacy = require("../models/Pharmacy");
const generateToken = require("../utils/generateToken");
const { notify } = require("./notificationController");

const sanitizeUser = (doc) => {
  const obj = doc.toObject();
  delete obj.passwordHash;
  return obj;
};

// POST /api/auth/register  (patient)
const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, address, lat, lng } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      address,
      location: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
      role: "patient",
    });

    const token = generateToken(user._id, "patient");
    res.status(201).json({ token, user: sanitizeUser(user), role: "patient" });
  } catch (err) {
    next(err);
  }
};

// POST /api/pharmacies/register
const registerPharmacy = async (req, res, next) => {
  try {
    const {
      pharmacyName,
      ownerName,
      email,
      phone,
      password,
      licenseNumber,
      address,
      lat,
      lng,
    } = req.body;

    const existing = await Pharmacy.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const pharmacy = await Pharmacy.create({
      pharmacyName,
      ownerName,
      email,
      phone,
      passwordHash,
      licenseNumber,
      address,
      location: { lat, lng },
      verificationStatus: "PENDING",
    });

    const token = generateToken(pharmacy._id, "pharmacy");

    const admins = await User.find({ role: "admin" }).select("_id");
    await Promise.all(
      admins.map((admin) =>
        notify({
          recipientType: "User",
          recipient: admin._id,
          title: "New pharmacy awaiting verification",
          message: `${pharmacyName} registered and is pending verification.`,
        })
      )
    );

    res.status(201).json({
      token,
      user: sanitizeUser(pharmacy),
      role: "pharmacy",
      message: "Registration successful. Your pharmacy is pending admin verification.",
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login  (handles patient, pharmacy, and admin — all live in User/Pharmacy)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let account = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    let role = account ? account.role : null; // "patient" or "admin"

    if (!account) {
      account = await Pharmacy.findOne({ email: email.toLowerCase() }).select("+passwordHash");
      role = account ? "pharmacy" : null;
    }

    if (!account) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (account.isActive === false) {
      return res.status(403).json({ message: "This account has been deactivated." });
    }

    const isMatch = await bcrypt.compare(password, account.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(account._id, role);
    res.json({ token, user: sanitizeUser(account), role });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json({ user: sanitizeUser(req.user.doc), role: req.user.role });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, registerPharmacy, login, getMe };
