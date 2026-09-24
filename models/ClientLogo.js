const mongoose = require("mongoose");

// ==========================================
// CLIENT LOGO SCHEMA
// ==========================================

const clientLogoSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: 200,
    },

    logo: {
      url: {
        type: String,
        required: [true, "Logo URL is required"],
        trim: true,
      },

      publicId: {
        type: String,
        trim: true,
        default: "",
      },

      altText: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },
    },

    website: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    industry: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

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
// INDEXES
// ==========================================

clientLogoSchema.index({
  isActive: 1,
  order: 1,
});

clientLogoSchema.index({
  isFeatured: 1,
  isActive: 1,
});

clientLogoSchema.index({
  industry: 1,
  isActive: 1,
});

// ==========================================
// MODEL
// ==========================================

const ClientLogo = mongoose.model(
  "ClientLogo",
  clientLogoSchema
);

module.exports = ClientLogo;