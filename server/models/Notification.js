const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientType: { type: String, enum: ["User", "Pharmacy"], required: true },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientType",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineRequest",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
