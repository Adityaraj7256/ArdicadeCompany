const mongoose = require("mongoose");
const Subscriber = require("../models/Subscriber");
const { sendNewsletterEmail } = require("../Services/emailService");

// ==========================================
// EMAIL VALIDATION
// ==========================================

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ==========================================
// OBJECT ID VALIDATION
// ==========================================

const validateObjectId = (id) => {
  return mongoose.isValidObjectId(id);
};

// ==========================================
// PUBLIC - SUBSCRIBE
// ==========================================

const subscribe = async (req, res, next) => {
  try {
    const { email, source } = req.body;

    // ----------------------------------------
    // EMAIL
    // ----------------------------------------

    if (
      !email ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // ----------------------------------------
    // SOURCE
    // ----------------------------------------

    const allowedSources = [
      "website",
      "footer",
      "blog",
      "contact",
      "other",
    ];

    const finalSource = source || "website";

    if (!allowedSources.includes(finalSource)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription source",
      });
    }

    // ----------------------------------------
    // EXISTING SUBSCRIBER
    // ----------------------------------------

    const existingSubscriber = await Subscriber.findOne({
      email: normalizedEmail,
    });

    if (existingSubscriber) {
      // Already subscribed
      if (existingSubscriber.status === "subscribed") {
        return res.status(409).json({
          success: false,
          message:
            "This email is already subscribed to our newsletter.",
        });
      }

      // Re-subscribe
      existingSubscriber.status = "subscribed";
      existingSubscriber.source = finalSource;
      existingSubscriber.subscribedAt = new Date();
      existingSubscriber.unsubscribedAt = null;

      await existingSubscriber.save();

      return res.status(200).json({
        success: true,
        message:
          "You have been subscribed to our newsletter again successfully.",
      });
    }

    // ----------------------------------------
    // CREATE SUBSCRIBER
    // ----------------------------------------

    await Subscriber.create({
      email: normalizedEmail,
      source: finalSource,
      status: "subscribed",
      subscribedAt: new Date(),
      unsubscribedAt: null,
    });

    return res.status(201).json({
      success: true,
      message:
        "You have been subscribed to our newsletter successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PUBLIC - UNSUBSCRIBE
// ==========================================

const unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (
      !email ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const subscriber = await Subscriber.findOne({
      email: normalizedEmail,
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message:
          "No newsletter subscription was found for this email.",
      });
    }

    if (subscriber.status === "unsubscribed") {
      return res.status(200).json({
        success: true,
        message:
          "This email is already unsubscribed.",
      });
    }

    subscriber.status = "unsubscribed";
    subscriber.unsubscribedAt = new Date();

    await subscriber.save();

    return res.status(200).json({
      success: true,
      message:
        "You have been unsubscribed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET ALL SUBSCRIBERS
// ==========================================

const getAllSubscribers = async (req, res, next) => {
  try {
    const filter = {};

    // ----------------------------------------
    // STATUS FILTER
    // ----------------------------------------

    if (req.query.status) {
      const allowedStatuses = [
        "subscribed",
        "unsubscribed",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscriber status",
        });
      }

      filter.status = req.query.status;
    }

    // ----------------------------------------
    // SOURCE FILTER
    // ----------------------------------------

    if (req.query.source) {
      filter.source = req.query.source;
    }

    // ----------------------------------------
    // SEARCH
    // ----------------------------------------

    if (req.query.search) {
      const search = req.query.search.trim();

      filter.email = {
        $regex: search,
        $options: "i",
      };
    }

    const subscribers = await Subscriber.find(filter)
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET SUBSCRIBER BY ID
// ==========================================

const getSubscriberById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscriber ID",
      });
    }

    const subscriber = await Subscriber.findById(id).lean();

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    return res.status(200).json({
      success: true,
      subscriber,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - UPDATE SUBSCRIBER STATUS
// ==========================================

const updateSubscriberStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscriber ID",
      });
    }

    const allowedStatuses = [
      "subscribed",
      "unsubscribed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be subscribed or unsubscribed",
      });
    }

    const subscriber = await Subscriber.findById(id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    subscriber.status = status;

    if (status === "subscribed") {
      subscriber.subscribedAt = new Date();
      subscriber.unsubscribedAt = null;
    }

    if (status === "unsubscribed") {
      subscriber.unsubscribedAt = new Date();
    }

    await subscriber.save();

    return res.status(200).json({
      success: true,
      message:
        "Subscriber status updated successfully",
      subscriber,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - DELETE SUBSCRIBER
// ==========================================

const deleteSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscriber ID",
      });
    }

    const subscriber = await Subscriber.findById(id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    await Subscriber.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET NEWSLETTER STATS
// ==========================================

const getNewsletterStats = async (
  req,
  res,
  next
) => {
  try {
    const total =
      await Subscriber.countDocuments();

    const subscribed =
      await Subscriber.countDocuments({
        status: "subscribed",
      });

    const unsubscribed =
      await Subscriber.countDocuments({
        status: "unsubscribed",
      });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        subscribed,
        unsubscribed,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - SEND NEWSLETTER
// ==========================================

const sendNewsletter = async (
  req,
  res,
  next
) => {
  try {
    const { subject, html, text } = req.body;

    // ----------------------------------------
    // SUBJECT VALIDATION
    // ----------------------------------------

    if (
      !subject ||
      typeof subject !== "string" ||
      !subject.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Newsletter subject is required",
      });
    }

    // ----------------------------------------
    // HTML CONTENT VALIDATION
    // ----------------------------------------

    if (
      !html ||
      typeof html !== "string" ||
      !html.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Newsletter content is required",
      });
    }

    // ----------------------------------------
    // GET SUBSCRIBED USERS ONLY
    // ----------------------------------------

    const subscribers =
      await Subscriber.find({
        status: "subscribed",
      })
        .select("email")
        .lean();

    if (!subscribers.length) {
      return res.status(404).json({
        success: false,
        message:
          "No subscribed newsletter users found.",
      });
    }

    // ----------------------------------------
    // CREATE EMAIL LIST
    // ----------------------------------------

    const recipients = subscribers
      .map((subscriber) => subscriber.email)
      .filter(
        (email) =>
          typeof email === "string" &&
          isValidEmail(email)
      );

    if (!recipients.length) {
      return res.status(404).json({
        success: false,
        message:
          "No valid subscriber email addresses found.",
      });
    }

    // ----------------------------------------
    // SEND NEWSLETTER
    // ----------------------------------------

    const result = await sendNewsletterEmail({
      recipients,
      subject: subject.trim(),
      html: html.trim(),
      text:
        typeof text === "string" && text.trim()
          ? text.trim()
          : undefined,
    });

    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Newsletter sent successfully.",
      totalRecipients: recipients.length,
      result,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  getSubscriberById,
  updateSubscriberStatus,
  deleteSubscriber,
  getNewsletterStats,
  sendNewsletter,
};