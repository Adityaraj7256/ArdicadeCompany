const express = require("express");

const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// AUTH ROUTES
// ==========================================

// POST /api/auth/register
router.post(
  "/register",
  register
);

// POST /api/auth/login
router.post(
  "/login",
  login
);

// POST /api/auth/logout
router.post(
  "/logout",
  logout
);

// GET /api/auth/me
router.get(
  "/me",
  protect,
  getMe
);

module.exports = router;