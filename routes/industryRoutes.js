const express = require("express");

const {
  getActiveIndustries,
  getAllIndustries,
  getIndustryById,
  getIndustryBySlug,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  toggleIndustryStatus,
} = require("../controllers/industryController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

// GET /api/industries
router.get(
  "/",
  getActiveIndustries
);

// GET /api/industries/slug/:slug
router.get(
  "/slug/:slug",
  getIndustryBySlug
);

// ==========================================
// ADMIN
// ==========================================

router.get(
  "/admin/all",
  protect,
  authorize("super_admin", "admin"),
  getAllIndustries
);

router.get(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  getIndustryById
);

router.post(
  "/admin",
  protect,
  authorize("super_admin", "admin"),
  createIndustry
);

router.put(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  updateIndustry
);

router.patch(
  "/admin/:id/status",
  protect,
  authorize("super_admin", "admin"),
  toggleIndustryStatus
);

router.delete(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  deleteIndustry
);

module.exports = router;