const express = require("express");

const {
  getSettings,
  createSettings,
  updateSettings,
  updateSettingsSection,
  resetSettings,
  getSettingsById,
  updateSettingsStatus,
} = require("../controllers/settingsController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// ALL SETTINGS ROUTES
// ==========================================
// Sirf authenticated admin users access kar sakte hain.

router.use(
  protect,
  authorize("super_admin", "admin")
);

// ==========================================
// GET SETTINGS
// ==========================================

router.get("/", getSettings);

// ==========================================
// CREATE SETTINGS
// ==========================================

router.post("/", createSettings);

// ==========================================
// UPDATE ALL SETTINGS
// ==========================================

router.patch("/", updateSettings);

// ==========================================
// UPDATE SINGLE SECTION
// ==========================================

router.patch("/section/:section", updateSettingsSection);

// ==========================================
// GET SETTINGS BY ID
// ==========================================

router.get("/:id", getSettingsById);

// ==========================================
// UPDATE ACTIVE STATUS
// ==========================================

router.patch("/status", updateSettingsStatus);

// ==========================================
// RESET SETTINGS
// ==========================================

router.post("/reset", resetSettings);

module.exports = router;