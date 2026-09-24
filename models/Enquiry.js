const mongoose = require("mongoose");

// ==========================================
// ENQUIRY SCHEMA
// ==========================================

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 150,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      maxlength: 200,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    company: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    subject: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },

    service: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 5000,
    },

    budget: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    source: {
      type: String,
      enum: [
        "contact",
        "get_quote",
        "consultation",
        "website",
        "other",
      ],
      default: "contact",
    },

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "in_progress",
        "converted",
        "rejected",
      ],
      default: "new",
    },

    priority: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "urgent",
      ],
      default: "medium",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    adminNotes: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    contactedAt: {
      type: Date,
      default: null,
    },

    convertedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

enquirySchema.index({
  status: 1,
  createdAt: -1,
});

enquirySchema.index({
  priority: 1,
  status: 1,
});

enquirySchema.index({
  email: 1,
});

enquirySchema.index({
  assignedTo: 1,
  status: 1,
});

enquirySchema.index({
  followUpDate: 1,
});

// ==========================================
// MODEL
// ==========================================

const Enquiry = mongoose.model(
  "Enquiry",
  enquirySchema
);

module.exports = Enquiry;