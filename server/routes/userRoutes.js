const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { getProfile, updateProfile, toggleSavedPharmacy } = require("../controllers/userController");

const router = express.Router();

router.get("/profile", protect, authorize("patient"), getProfile);
router.put("/profile", protect, authorize("patient"), updateProfile);
router.put("/saved-pharmacies/:pharmacyId", protect, authorize("patient"), toggleSavedPharmacy);

module.exports = router;
