const express = require("express");

const {
  getActiveTestimonials,
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
} = require("../controllers/testimonialController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

router.get(
  "/",
  getActiveTestimonials
);

// ==========================================
// ADMIN
// ==========================================

router.get(
  "/admin/all",
  protect,
  authorize("super_admin", "admin"),
  getAllTestimonials
);

router.get(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  getTestimonialById
);

router.post(
  "/admin",
  protect,
  authorize("super_admin", "admin"),
  createTestimonial
);

router.put(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  updateTestimonial
);

router.patch(
  "/admin/:id/status",
  protect,
  authorize("super_admin", "admin"),
  toggleTestimonialStatus
);

router.delete(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  deleteTestimonial
);

module.exports = router;