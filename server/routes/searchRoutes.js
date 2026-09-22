const express = require("express");
const { searchMedicines, searchNearbyPharmacies } = require("../controllers/searchController");

const router = express.Router();

router.get("/medicines", searchMedicines);
router.get("/nearby", searchNearbyPharmacies);

module.exports = router;
