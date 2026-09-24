const express = require("express");

const {
  getAdminDashboard,
} = require("../controllers/adminController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get(
  "/dashboard",
  protect,
  authorize("super_admin", "admin"),
  getAdminDashboard
);

module.exports = router;