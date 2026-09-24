const express = require("express");

const {
  uploadMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
} = require("../controllers/mediaController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const adminAccess = [
  "super_admin",
  "admin",
];

// ==========================================
// GET ALL MEDIA
// ==========================================

router.get(
  "/admin/all",
  protect,
  authorize(...adminAccess),
  getAllMedia
);

// ==========================================
// GET SINGLE MEDIA
// ==========================================

router.get(
  "/admin/:id",
  protect,
  authorize(...adminAccess),
  getMediaById
);

// ==========================================
// UPLOAD MEDIA
// IMPORTANT: /upload must come before /:id
// ==========================================

router.post(
  "/admin/upload",
  protect,
  authorize(...adminAccess),
  upload.single("file"),
  uploadMedia
);

// ==========================================
// UPDATE MEDIA METADATA
// ==========================================

router.put(
  "/admin/:id",
  protect,
  authorize(...adminAccess),
  updateMedia
);

// ==========================================
// DELETE MEDIA
// ==========================================

router.delete(
  "/admin/:id",
  protect,
  authorize(...adminAccess),
  deleteMedia
);

module.exports = router;