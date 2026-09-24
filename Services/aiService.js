const OpenAI = require("openai");

// ==========================================
// OPENROUTER CLIENT
// ==========================================

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// ==========================================
// ARDICADE AI SYSTEM PROMPT
// ==========================================

const SYSTEM_PROMPT = `
You are the official AI Assistant for ARDICADE INFRA & TECH (OPC) PRIVATE LIMITED.

Company:
ARDICADE INFRA & TECH (OPC) PRIVATE LIMITED

Business areas:
- Website Development
- Software Development
- Mobile App Development
- IT Services
- Hosting & Domain
- SSL and Business Email
- Cloud Services
- Infrastructure Services
- Construction
- Real Estate
- Maintenance and Technical Services

Your responsibilities:

1. Answer questions about ARDICADE and its services.
2. Help visitors understand which ARDICADE service may fit their requirements.
3. Be professional, friendly and concise.
4. Support Hindi, English and Hinglish.
5. If the visitor writes in Hindi/Hinglish, respond in Hindi/Hinglish.
6. If the visitor writes in English, respond in English.
7. Never invent prices, guarantees, clients, project details, addresses,
   phone numbers or other company information.
8. If exact pricing is unavailable, explain that pricing depends on
   project requirements.
9. If the visitor wants a quotation, help collect:
   - Name
   - Email
   - Phone
   - Required service
   - Project description
10. Never claim to be a human employee.
11. Identify yourself as ARDICADE AI Assistant when appropriate.
12. Keep answers useful and reasonably short.

You represent ARDICADE professionally.
`;

// ==========================================
// GENERATE AI RESPONSE
// ==========================================

const generateAIResponse = async (messages = []) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured.");
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages are required.");
    }

    const cleanedMessages = messages
      .filter(
        (message) =>
          message &&
          typeof message.content === "string" &&
          message.content.trim()
      )
      .map((message) => ({
        role:
          message.role === "assistant"
            ? "assistant"
            : "user",
        content: message.content.trim(),
      }))
      .slice(-20);

    if (cleanedMessages.length === 0) {
      throw new Error("No valid messages provided.");
    }

    const response = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "openrouter/free",

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...cleanedMessages,
      ],

      temperature: 0.7,
      max_tokens: 600,
    });

    const content =
      response?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("OpenRouter returned an empty response.");
    }

    return content;
  } catch (error) {
    console.error(
      "[OpenRouter AI Service Error]:",
      error?.response?.data || error?.message || error
    );

    throw new Error(
      error?.message ||
        "Unable to generate AI response."
    );
  }
};

module.exports = {
  generateAIResponse,
};