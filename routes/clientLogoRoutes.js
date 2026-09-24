const express = require("express");

const {
  getActiveClientLogos,
  getAllClientLogos,
  getClientLogoById,
  createClientLogo,
  updateClientLogo,
  deleteClientLogo,
  toggleClientLogoStatus,
} = require("../controllers/clientLogoController");

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
  getActiveClientLogos
);

// ==========================================
// ADMIN
// ==========================================

router.get(
  "/admin/all",
  protect,
  authorize("super_admin", "admin"),
  getAllClientLogos
);

router.get(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  getClientLogoById
);

router.post(
  "/admin",
  protect,
  authorize("super_admin", "admin"),
  createClientLogo
);

router.put(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  updateClientLogo
);

router.patch(
  "/admin/:id/status",
  protect,
  authorize("super_admin", "admin"),
  toggleClientLogoStatus
);

router.delete(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  deleteClientLogo
);

module.exports = router;