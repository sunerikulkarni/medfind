const express = require("express");
const { protect } = require("../middleware/auth");
const { listNotifications, markRead, markAllRead } = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, listNotifications);
router.put("/read-all", protect, markAllRead);
router.put("/:id/read", protect, markRead);

module.exports = router;
