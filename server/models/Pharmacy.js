const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema(
  {
    pharmacyName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    licenseNumber: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    operatingHours: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "21:00" },
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
    },
    rejectionReason: { type: String },
    role: { type: String, default: "pharmacy" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

pharmacySchema.index({ email: 1 });
pharmacySchema.index({ "location.lat": 1, "location.lng": 1 });
pharmacySchema.index({ verificationStatus: 1 });

// Helper: is the pharmacy currently open, based on operatingHours (server local time)
pharmacySchema.methods.isCurrentlyOpen = function () {
  try {
    const now = new Date();
    const [openH, openM] = this.operatingHours.open.split(":").map(Number);
    const [closeH, closeM] = this.operatingHours.close.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (closeMinutes > openMinutes) {
      return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
    }
    // overnight hours (e.g. open 20:00 close 02:00)
    return nowMinutes >= openMinutes || nowMinutes <= closeMinutes;
  } catch {
    return true;
  }
};

module.exports = mongoose.model("Pharmacy", pharmacySchema);
