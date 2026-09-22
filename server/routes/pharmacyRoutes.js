const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { registerPharmacy } = require("../controllers/authController");
const {
  listPharmacies,
  nearbyPharmacies,
  getPharmacy,
  updatePharmacy,
  getDashboardStats,
} = require("../controllers/pharmacyController");

const router = express.Router();

const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post(
  "/register",
  registerLimiter,
  [
    body("pharmacyName").trim().notEmpty().withMessage("Pharmacy name is required."),
    body("ownerName").trim().notEmpty().withMessage("Owner name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("phone").trim().notEmpty().withMessage("Phone number is required."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    body("licenseNumber").trim().notEmpty().withMessage("Registration/license number is required."),
    body("address").trim().notEmpty().withMessage("Address is required."),
    body("lat").isFloat().withMessage("Latitude is required."),
    body("lng").isFloat().withMessage("Longitude is required."),
  ],
  validate,
  registerPharmacy
);

router.get("/nearby", nearbyPharmacies);
router.get("/", listPharmacies);
router.get("/me/dashboard", protect, authorize("pharmacy"), getDashboardStats);
router.get("/:id", getPharmacy);
router.put("/:id", protect, authorize("pharmacy"), updatePharmacy);

module.exports = router;
