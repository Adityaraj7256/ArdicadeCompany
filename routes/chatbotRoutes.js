const express = require("express");

const {
  sendChatMessage,
} = require("../controllers/chatbotController");

const router = express.Router();

// ==========================================
// PUBLIC CHATBOT ROUTE
// ==========================================

router.post("/message", sendChatMessage);

module.exports = router;