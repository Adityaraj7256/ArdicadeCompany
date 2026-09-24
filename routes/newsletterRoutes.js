const express = require("express");

const {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  getSubscriberById,
  updateSubscriberStatus,
  deleteSubscriber,
  getNewsletterStats,
  sendNewsletter,
} = require("../controllers/newsletterController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

// Subscribe
router.post(
  "/subscribe",
  subscribe
);

// Unsubscribe
router.post(
  "/unsubscribe",
  unsubscribe
);

// ==========================================
// ADMIN
// ==========================================

// Statistics
router.get(
  "/admin/stats",
  protect,
  authorize("super_admin", "admin"),
  getNewsletterStats
);

// All subscribers
router.get(
  "/admin/all",
  protect,
  authorize("super_admin", "admin"),
  getAllSubscribers
);

// Send newsletter to all subscribed users
router.post(
  "/admin/send",
  protect,
  authorize("super_admin", "admin"),
  sendNewsletter
);

// Single subscriber
router.get(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  getSubscriberById
);

// Update subscriber status
router.patch(
  "/admin/:id/status",
  protect,
  authorize("super_admin", "admin"),
  updateSubscriberStatus
);

// Delete subscriber
router.delete(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  deleteSubscriber
);

module.exports = router;