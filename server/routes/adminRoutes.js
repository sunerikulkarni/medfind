const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getDashboard,
  getPendingPharmacies,
  approvePharmacy,
  rejectPharmacy,
  suspendPharmacy,
  getUsers,
  getAllPharmacies,
  getAllRequests,
  removeMedicine,
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboard);
router.get("/pharmacies/pending", getPendingPharmacies);
router.get("/pharmacies", getAllPharmacies);
router.put("/pharmacies/:id/approve", approvePharmacy);
router.put("/pharmacies/:id/reject", rejectPharmacy);
router.put("/pharmacies/:id/suspend", suspendPharmacy);
router.get("/users", getUsers);
router.get("/requests", getAllRequests);
router.delete("/medicines/:id", removeMedicine);

module.exports = router;
