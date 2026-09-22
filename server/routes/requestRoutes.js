const express = require("express");
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createRequest,
  listRequests,
  getRequest,
  updateStatus,
  cancelRequest,
} = require("../controllers/requestController");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("patient"),
  [
    body("pharmacyId").isMongoId().withMessage("A valid pharmacy is required."),
    body("medicineId").isMongoId().withMessage("A valid medicine is required."),
    body("quantityRequested").isInt({ min: 1 }).withMessage("Quantity must be at least 1."),
  ],
  validate,
  createRequest
);

router.get("/", protect, authorize("patient", "pharmacy"), listRequests);
router.get("/:id", protect, getRequest);
router.put(
  "/:id/status",
  protect,
  authorize("patient", "pharmacy"),
  [body("status").isIn(["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"])],
  validate,
  updateStatus
);
router.delete("/:id", protect, authorize("patient"), cancelRequest);

module.exports = router;
