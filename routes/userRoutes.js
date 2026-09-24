const express = require("express");

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserStats,
} = require("../controllers/userController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// USER MANAGEMENT
// ==========================================

// All user-management routes require authentication
router.use(
  protect,
  authorize("super_admin", "admin")
);

// ==========================================
// GET USER STATS
// GET /api/users/admin/stats
// ==========================================

router.get(
  "/admin/stats",
  getUserStats
);

// ==========================================
// GET ALL USERS
// GET /api/users/admin/all
// ==========================================

router.get(
  "/admin/all",
  getAllUsers
);

// ==========================================
// CREATE USER
// POST /api/users/admin
// ==========================================

router.post(
  "/admin",
  createUser
);

// ==========================================
// GET SINGLE USER
// GET /api/users/admin/:id
// ==========================================

router.get(
  "/admin/:id",
  getUserById
);

// ==========================================
// UPDATE USER
// PATCH /api/users/admin/:id
// ==========================================

router.patch(
  "/admin/:id",
  updateUser
);

// ==========================================
// UPDATE USER ROLE
// PATCH /api/users/admin/:id/role
// ==========================================

router.patch(
  "/admin/:id/role",
  updateUserRole
);

// ==========================================
// UPDATE USER STATUS
// PATCH /api/users/admin/:id/status
// ==========================================

router.patch(
  "/admin/:id/status",
  updateUserStatus
);

// ==========================================
// DELETE USER
// DELETE /api/users/admin/:id
// ==========================================

router.delete(
  "/admin/:id",
  deleteUser
);

module.exports = router;