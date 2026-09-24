const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendNewsletterEmail = async ({
  recipients,
  subject,
  html,
  text,
}) => {
  try {
    // ==============================
    // VALIDATION
    // ==============================

    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured.");
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new Error("At least one recipient is required.");
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      throw new Error("Email subject is required.");
    }

    if (!html || typeof html !== "string" || !html.trim()) {
      throw new Error("Email HTML content is required.");
    }

    // ==============================
    // SENDER
    // ==============================

    const fromEmail = process.env.NEWSLETTER_FROM_EMAIL;
    const fromName = process.env.NEWSLETTER_FROM_NAME || "ARDICADE";

    if (!fromEmail) {
      throw new Error("NEWSLETTER_FROM_EMAIL is not configured.");
    }

    const from = `${fromName} <${fromEmail}>`;

    console.log("[Newsletter] From:", from);
    console.log("[Newsletter] Recipients:", recipients.length);

    // ==============================
    // SEND EMAIL
    // ==============================

    const { data, error } = await resend.emails.send({
      from,
      to: fromEmail,
      bcc: recipients,
      subject: subject.trim(),
      html: html.trim(),
      ...(typeof text === "string" && text.trim()
        ? {
          text: text.trim(),
        }
        : {}),
    });

    // ==============================
    // RESEND ERROR
    // ==============================

    if (error) {
      console.error("[Resend API Error]:", error);

      throw new Error(
        error.message || "Failed to send newsletter email."
      );
    }

    // ==============================
    // SUCCESS
    // ==============================

    console.log("[Newsletter] Sent successfully:", data?.id);

    return {
      success: true,
      id: data?.id || null,
    };
  } catch (error) {
    console.error("[Email Service Error]:", error);
    throw error;
  }
};

module.exports = {
  sendNewsletterEmail,
};