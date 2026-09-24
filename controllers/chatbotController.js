const { generateAIResponse } = require("../Services/aiService");

// ==========================================
// SEND CHAT MESSAGE
// ==========================================

const sendChatMessage = async (req, res) => {
  try {
    const { messages } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Chat messages are required.",
      });
    }

    // ==========================================
    // MESSAGE LIMIT
    // ==========================================

    if (messages.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Too many messages in one request.",
      });
    }

    // ==========================================
    // VALIDATE MESSAGE CONTENT
    // ==========================================

    const validMessages = messages.filter(
      (message) =>
        message &&
        typeof message.content === "string" &&
        message.content.trim()
    );

    if (validMessages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message.",
      });
    }

    // ==========================================
    // GENERATE AI RESPONSE
    // ==========================================

    const reply = await generateAIResponse(validMessages);

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "AI response generated successfully.",
      data: {
        reply,
      },
    });
  } catch (error) {
    console.error(
      "[Chatbot Controller Error]:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to process chatbot request.",
    });
  }
};

module.exports = {
  sendChatMessage,
};