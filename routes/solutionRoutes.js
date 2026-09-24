const express = require("express");

const {
  getActiveSolutions,
  getSolutionBySlug,
  getAllSolutions,
  getSolutionById,
  createSolution,
  updateSolution,
  deleteSolution,
  toggleSolutionStatus,
} = require("../controllers/solutionController");

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
  getActiveSolutions
);

router.get(
  "/slug/:slug",
  getSolutionBySlug
);

// ==========================================
// ADMIN
// ==========================================

router.get(
  "/admin/all",
  protect,
  authorize("super_admin", "admin"),
  getAllSolutions
);

router.get(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  getSolutionById
);

router.post(
  "/admin",
  protect,
  authorize("super_admin", "admin"),
  createSolution
);

router.put(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  updateSolution
);

router.patch(
  "/admin/:id/status",
  protect,
  authorize("super_admin", "admin"),
  toggleSolutionStatus
);

router.delete(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  deleteSolution
);

module.exports = router;