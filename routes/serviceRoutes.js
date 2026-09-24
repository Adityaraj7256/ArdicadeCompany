const express = require("express");

const {
  getActiveServices,
  getServiceBySlug,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} = require("../controllers/serviceController");

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
  getActiveServices
);

router.get(
  "/slug/:slug",
  getServiceBySlug
);

// ==========================================
// ADMIN
// ==========================================

router.get(
  "/admin/all",
  protect,
  authorize("super_admin", "admin"),
  getAllServices
);

router.get(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  getServiceById
);

router.post(
  "/admin",
  protect,
  authorize("super_admin", "admin"),
  createService
);

router.put(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  updateService
);

router.patch(
  "/admin/:id/status",
  protect,
  authorize("super_admin", "admin"),
  toggleServiceStatus
);

router.delete(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  deleteService
);

module.exports = router;