const express = require("express");

const {
  getActiveAbout,
  getAllAbout,
  getAboutById,
  createAbout,
  updateAbout,
  deleteAbout,
  toggleAboutStatus,
} = require("../controllers/aboutController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

router.get("/", getActiveAbout);

// ==========================================
// ADMIN
// ==========================================

router.get(
  "/admin/all",
  protect,
  authorize("super_admin", "admin"),
  getAllAbout
);

router.get(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  getAboutById
);

router.post(
  "/admin",
  protect,
  authorize("super_admin", "admin"),
  createAbout
);

router.put(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  updateAbout
);

router.patch(
  "/admin/:id/status",
  protect,
  authorize("super_admin", "admin"),
  toggleAboutStatus
);

router.delete(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  deleteAbout
);

module.exports = router;