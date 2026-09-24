const express = require("express");

const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  addPayment,
  updatePayment,
  deletePayment,
  getPaymentHistory,
  getClientStats,
  getUpcomingExpiries,
  updateClientStatus,
} = require("../controllers/clientController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// ADMIN AUTHORIZATION
// ==========================================

router.use(
  protect,
  authorize("super_admin", "admin")
);

// ==========================================
// CLIENT LIST / STATS
// IMPORTANT:
// Specific routes must come before /:id
// ==========================================

// Get all clients
router.get("/admin/all", getAllClients);

// Get client statistics
router.get("/admin/stats", getClientStats);

// Get upcoming domain / hosting / SSL expiries
router.get("/admin/expiries", getUpcomingExpiries);

// ==========================================
// CLIENT PAYMENT ROUTES
// IMPORTANT:
// These must come before /admin/:id
// ==========================================

// Get payment history
router.get(
  "/admin/:id/payments",
  getPaymentHistory
);

// Add payment
router.post(
  "/admin/:id/payments",
  addPayment
);

// Update payment
router.patch(
  "/admin/:id/payments/:paymentId",
  updatePayment
);

// Delete payment
router.delete(
  "/admin/:id/payments/:paymentId",
  deletePayment
);

// ==========================================
// CLIENT STATUS
// ==========================================

router.patch(
  "/admin/:id/status",
  updateClientStatus
);

// ==========================================
// CLIENT CRUD
// ==========================================

// Get single client
router.get(
  "/admin/:id",
  getClientById
);

// Create client
router.post(
  "/admin",
  createClient
);

// Update client
router.patch(
  "/admin/:id",
  updateClient
);

// Delete client
router.delete(
  "/admin/:id",
  deleteClient
);

module.exports = router;