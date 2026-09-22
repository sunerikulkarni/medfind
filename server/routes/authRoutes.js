const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { registerUser, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many attempts. Please try again later." },
});

router.post(
  "/register",
  authLimiter,
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("phone").trim().notEmpty().withMessage("Phone number is required."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) throw new Error("Passwords do not match.");
      return true;
    }),
    body("address").trim().notEmpty().withMessage("Address is required."),
  ],
  validate,
  registerUser
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  login
);

router.get("/me", protect, getMe);

module.exports = router;
