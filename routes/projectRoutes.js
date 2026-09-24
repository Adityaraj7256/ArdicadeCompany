const express = require("express");

const {
  getActiveProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  toggleProjectStatus,
  toggleProjectFeatured,
  deleteProject,
} = require("../controllers/projectController");

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
  getActiveProjects
);

router.get(
  "/featured",
  getFeaturedProjects
);

router.get(
  "/slug/:slug",
  getProjectBySlug
);

// ==========================================
// ADMIN
// ==========================================

router.get(
  "/admin/all",
  protect,
  authorize("super_admin", "admin"),
  getAllProjects
);

router.get(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  getProjectById
);

router.post(
  "/admin",
  protect,
  authorize("super_admin", "admin"),
  createProject
);

router.put(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  updateProject
);

router.patch(
  "/admin/:id/status",
  protect,
  authorize("super_admin", "admin"),
  toggleProjectStatus
);

router.patch(
  "/admin/:id/featured",
  protect,
  authorize("super_admin", "admin"),
  toggleProjectFeatured
);

router.delete(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  deleteProject
);

module.exports = router;