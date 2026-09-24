const express = require("express");

const {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
} = require("../controllers/enquiryController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

// Create enquiry from website
router.post(
  "/",
  createEnquiry
);

// ==========================================
// ADMIN
// ==========================================

router.get(
  "/admin/all",
  protect,
  authorize("super_admin", "admin"),
  getAllEnquiries
);

router.get(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  getEnquiryById
);

router.put(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  updateEnquiry
);

router.patch(
  "/admin/:id/status",
  protect,
  authorize("super_admin", "admin"),
  updateEnquiryStatus
);

router.delete(
  "/admin/:id",
  protect,
  authorize("super_admin", "admin"),
  deleteEnquiry
);

module.exports = router;