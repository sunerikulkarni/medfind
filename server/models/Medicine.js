const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    strength: { type: String, trim: true },
    form: {
      type: String,
      enum: ["tablet", "capsule", "syrup", "injection", "ointment", "drops", "other"],
      default: "tablet",
    },
    manufacturer: { type: String, trim: true },
    batchNumber: { type: String, trim: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    price: { type: Number, required: true, min: 0 },
    manuallyUnavailable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

medicineSchema.index({ name: "text", genericName: "text", category: "text" });
medicineSchema.index({ pharmacy: 1 });

medicineSchema.virtual("isExpired").get(function () {
  return this.expiryDate < new Date();
});

medicineSchema.virtual("isLowStock").get(function () {
  return this.quantity > 0 && this.quantity <= this.lowStockThreshold;
});

medicineSchema.virtual("isAvailable").get(function () {
  return !this.manuallyUnavailable && !this.isExpired && this.quantity > 0;
});

medicineSchema.set("toJSON", { virtuals: true });
medicineSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Medicine", medicineSchema);
