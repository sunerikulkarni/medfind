const mongoose = require("mongoose");

const medicineRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    quantityRequested: { type: Number, required: true, min: 1 },
    note: { type: String, trim: true, maxlength: 500 },
    urgency: { type: String, enum: ["NORMAL", "URGENT"], default: "NORMAL" },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
    },
    statusReason: { type: String, trim: true },
  },
  { timestamps: true }
);

medicineRequestSchema.index({ user: 1, createdAt: -1 });
medicineRequestSchema.index({ pharmacy: 1, status: 1 });

module.exports = mongoose.model("MedicineRequest", medicineRequestSchema);
