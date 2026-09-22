const Notification = require("../models/Notification");

const notify = async ({ recipientType, recipient, title, message, relatedRequest }) => {
  return Notification.create({ recipientType, recipient, title, message, relatedRequest });
};

// GET /api/notifications
const listNotifications = async (req, res, next) => {
  try {
    const recipientType = req.user.role === "pharmacy" ? "Pharmacy" : "User";
    const notifications = await Notification.find({
      recipient: req.user.id,
      recipientType,
    }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/:id/read
const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found." });
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "This notification does not belong to you." });
    }
    notification.isRead = true;
    await notification.save();
    res.json({ notification });
  } catch (err) {
    next(err);
  }
};

module.exports = { notify, listNotifications, markRead };
