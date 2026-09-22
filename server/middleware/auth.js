const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Pharmacy = require("../models/Pharmacy");

// Verifies the JWT and attaches req.user = { id, role, doc }
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token provided." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let account;
    if (decoded.role === "pharmacy") {
      account = await Pharmacy.findById(decoded.id);
    } else {
      account = await User.findById(decoded.id);
    }

    if (!account || account.isActive === false) {
      return res.status(401).json({ message: "Account not found or deactivated." });
    }

    req.user = { id: decoded.id, role: decoded.role, doc: account };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token." });
  }
};

// Restrict access to specific roles: authorize("admin"), authorize("pharmacy","admin")
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to perform this action." });
  }
  next();
};

module.exports = { protect, authorize };
