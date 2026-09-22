const Medicine = require("../models/Medicine");

// POST /api/medicines  (pharmacy only)
const createMedicine = async (req, res, next) => {
  try {
    const {
      name,
      genericName,
      category,
      strength,
      form,
      manufacturer,
      batchNumber,
      expiryDate,
      quantity,
      lowStockThreshold,
      price,
    } = req.body;

    if (new Date(expiryDate) < new Date()) {
      return res.status(400).json({ message: "Expiry date cannot be in the past." });
    }

    const medicine = await Medicine.create({
      pharmacy: req.user.id,
      name,
      genericName,
      category,
      strength,
      form,
      manufacturer,
      batchNumber,
      expiryDate,
      quantity,
      lowStockThreshold,
      price,
    });

    res.status(201).json({ medicine });
  } catch (err) {
    next(err);
  }
};

// GET /api/medicines  (pharmacy's own inventory list)
const listOwnMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ pharmacy: req.user.id }).sort({ createdAt: -1 });
    res.json({ medicines });
  } catch (err) {
    next(err);
  }
};

// GET /api/medicines/:id
const getMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found." });
    res.json({ medicine });
  } catch (err) {
    next(err);
  }
};

// PUT /api/medicines/:id  (owning pharmacy only)
const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found." });
    if (medicine.pharmacy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own inventory." });
    }

    const allowedFields = [
      "name",
      "genericName",
      "category",
      "strength",
      "form",
      "manufacturer",
      "batchNumber",
      "expiryDate",
      "quantity",
      "lowStockThreshold",
      "price",
      "manuallyUnavailable",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) medicine[field] = req.body[field];
    });

    await medicine.save();
    res.json({ medicine });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/medicines/:id
const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found." });
    if (medicine.pharmacy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own inventory." });
    }
    await medicine.deleteOne();
    res.json({ message: "Medicine deleted." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMedicine,
  listOwnMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
};
