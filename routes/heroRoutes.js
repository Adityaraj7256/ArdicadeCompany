const express = require("express");

const {
  getActiveHeroes,
  getAllHeroes,
  getHeroById,
  createHero,
  updateHero,
  deleteHero,
  toggleHeroStatus,
} = require("../controllers/heroController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// PUBLIC ROUTES
// ======================================================

// GET /api/hero
router.get(
  "/",
  getActiveHeroes
);

// ======================================================
// ADMIN ROUTES
// ======================================================

// GET /api/hero/admin/all
router.get(
  "/admin/all",
  protect,
  authorize("super_admin", "admin"),
  getAllHeroes
);

// GET /api/hero/admin/:id
router.get(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  getHeroById
);

// POST /api/hero/admin
router.post(
  "/admin",
  protect,
  authorize("super_admin", "admin"),
  createHero
);

// PUT /api/hero/admin/:id
router.put(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  updateHero
);

// PATCH /api/hero/admin/:id/status
router.patch(
  "/admin/:id/status",
  protect,
  authorize("super_admin", "admin"),
  toggleHeroStatus
);

// DELETE /api/hero/admin/:id
router.delete(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  deleteHero
);

module.exports = router;