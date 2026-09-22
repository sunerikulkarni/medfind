const express = require("express");
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createMedicine,
  listOwnMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/medicineController");

const router = express.Router();

const medicineValidation = [
  body("name").trim().notEmpty().withMessage("Medicine name is required."),
  body("category").trim().notEmpty().withMessage("Category is required."),
  body("expiryDate").isISO8601().withMessage("A valid expiry date is required."),
  body("quantity").isInt({ min: 0 }).withMessage("Quantity must be zero or more."),
  body("price").isFloat({ min: 0 }).withMessage("Price must be zero or more."),
];

router.post("/", protect, authorize("pharmacy"), medicineValidation, validate, createMedicine);
router.get("/", protect, authorize("pharmacy"), listOwnMedicines);
router.get("/:id", getMedicine);
router.put("/:id", protect, authorize("pharmacy"), updateMedicine);
router.delete("/:id", protect, authorize("pharmacy"), deleteMedicine);

module.exports = router;
