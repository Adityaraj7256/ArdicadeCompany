const mongoose = require("mongoose");

// ==========================================
// SETTINGS SCHEMA
// ==========================================

const settingsSchema = new mongoose.Schema(
  {
    // ==========================================
    // COMPANY INFORMATION
    // ==========================================

    company: {
      name: {
        type: String,
        default: "ARDICADE INFRA & TECH (OPC) PRIVATE LIMITED",
        trim: true,
        maxlength: 200,
      },

      tagline: {
        type: String,
        default: "",
        trim: true,
        maxlength: 300,
      },

      description: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
      },

      logo: {
        type: String,
        default: "",
        trim: true,
      },

      favicon: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ==========================================
    // CONTACT INFORMATION
    // ==========================================

    contact: {
      email: {
        type: String,
        default: "",
        lowercase: true,
        trim: true,
        maxlength: 200,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
        maxlength: 30,
      },

      alternatePhone: {
        type: String,
        default: "",
        trim: true,
        maxlength: 30,
      },

      whatsapp: {
        type: String,
        default: "",
        trim: true,
        maxlength: 30,
      },
    },

    // ==========================================
    // ADDRESS
    // ==========================================

    address: {
      street: {
        type: String,
        default: "",
        trim: true,
        maxlength: 300,
      },

      city: {
        type: String,
        default: "",
        trim: true,
        maxlength: 100,
      },

      state: {
        type: String,
        default: "",
        trim: true,
        maxlength: 100,
      },

      country: {
        type: String,
        default: "India",
        trim: true,
        maxlength: 100,
      },

      pincode: {
        type: String,
        default: "",
        trim: true,
        maxlength: 20,
      },

      mapUrl: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ==========================================
    // SOCIAL MEDIA
    // ==========================================

    social: {
      linkedin: {
        type: String,
        default: "",
        trim: true,
      },

      facebook: {
        type: String,
        default: "",
        trim: true,
      },

      instagram: {
        type: String,
        default: "",
        trim: true,
      },

      twitter: {
        type: String,
        default: "",
        trim: true,
      },

      youtube: {
        type: String,
        default: "",
        trim: true,
      },

      github: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ==========================================
    // WEBSITE / SEO
    // ==========================================

    website: {
      title: {
        type: String,
        default: "ARDICADE INFRA & TECH",
        trim: true,
        maxlength: 200,
      },

      metaDescription: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      metaKeywords: {
        type: String,
        default: "",
        trim: true,
        maxlength: 1000,
      },

      canonicalUrl: {
        type: String,
        default: "",
        trim: true,
      },

      maintenanceMode: {
        type: Boolean,
        default: false,
      },

      maintenanceMessage: {
        type: String,
        default: "Our website is currently under maintenance. Please check back soon.",
        trim: true,
        maxlength: 1000,
      },
    },

    // ==========================================
    // EMAIL SETTINGS
    // ==========================================

    email: {
      senderName: {
        type: String,
        default: "ARDICADE",
        trim: true,
        maxlength: 200,
      },

      senderEmail: {
        type: String,
        default: "",
        lowercase: true,
        trim: true,
        maxlength: 200,
      },

      replyTo: {
        type: String,
        default: "",
        lowercase: true,
        trim: true,
        maxlength: 200,
      },
    },

    // ==========================================
    // NOTIFICATION SETTINGS
    // ==========================================

    notifications: {
      newEnquiry: {
        type: Boolean,
        default: true,
      },

      newSubscriber: {
        type: Boolean,
        default: true,
      },

      newUser: {
        type: Boolean,
        default: true,
      },

      projectUpdate: {
        type: Boolean,
        default: true,
      },

      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },

    // ==========================================
    // GENERAL SETTINGS
    // ==========================================

    general: {
      timezone: {
        type: String,
        default: "Asia/Kolkata",
        trim: true,
      },

      dateFormat: {
        type: String,
        default: "DD/MM/YYYY",
        trim: true,
      },

      currency: {
        type: String,
        default: "INR",
        trim: true,
      },

      language: {
        type: String,
        default: "en",
        trim: true,
      },
    },

    // ==========================================
    // SETTINGS STATUS
    // ==========================================

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// SINGLE SETTINGS DOCUMENT
// ==========================================

const Settings =
  mongoose.models.Settings ||
  mongoose.model("Settings", settingsSchema);

module.exports = Settings;