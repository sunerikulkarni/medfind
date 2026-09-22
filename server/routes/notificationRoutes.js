const express = require("express");
const { protect } = require("../middleware/auth");
const { listNotifications, markRead } = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, listNotifications);
router.put("/:id/read", protect, markRead);

module.exports = router;
