const express = require("express");

const {
  getPublishedInsights,
  getPublishedInsightBySlug,
  getAllInsights,
  getInsightById,
  createInsight,
  updateInsight,
  deleteInsight,
  toggleInsightStatus,
  togglePublishStatus,
} = require("../controllers/insightController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

// All published insights
router.get(
  "/",
  getPublishedInsights
);

// Single published insight
router.get(
  "/slug/:slug",
  getPublishedInsightBySlug
);

// ==========================================
// ADMIN
// ==========================================

// All insights including drafts
router.get(
  "/admin/all",
  protect,
  authorize("super_admin", "admin"),
  getAllInsights
);

// Single insight
router.get(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  getInsightById
);

// Create
router.post(
  "/admin",
  protect,
  authorize("super_admin", "admin"),
  createInsight
);

// Update
router.put(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  updateInsight
);

// Toggle active/inactive
router.patch(
  "/admin/:id/status",
  protect,
  authorize("super_admin", "admin"),
  toggleInsightStatus
);

// Publish / Draft
router.patch(
  "/admin/:id/publish",
  protect,
  authorize("super_admin", "admin"),
  togglePublishStatus
);

// Delete
router.delete(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  deleteInsight
);

module.exports = router;