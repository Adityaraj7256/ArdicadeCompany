const mongoose = require("mongoose");

// ==========================================
// NEWSLETTER SUBSCRIBER SCHEMA
// ==========================================

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },

    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },

    source: {
      type: String,
      enum: [
        "website",
        "footer",
        "blog",
        "contact",
        "other",
      ],
      default: "website",
    },

    subscribedAt: {
      type: Date,
      default: Date.now,
    },

    unsubscribedAt: {
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

subscriberSchema.index({
  status: 1,
  createdAt: -1,
});

subscriberSchema.index({
  email: 1,
});

// ==========================================
// MODEL
// ==========================================

const Subscriber = mongoose.model(
  "Subscriber",
  subscriberSchema
);

module.exports = Subscriber;