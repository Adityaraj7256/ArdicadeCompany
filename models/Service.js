const mongoose = require("mongoose");

// ==========================================
// IMAGE SCHEMA
// ==========================================

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      default: "",
      trim: true,
    },

    altText: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// FEATURE SCHEMA
// ==========================================

const featureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// SERVICE SCHEMA
// ==========================================

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "technology",
        "infrastructure",
        "construction",
      ],
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 10000,
    },

    image: {
      type: imageSchema,
      required: true,
    },

    icon: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    features: {
      type: [featureSchema],
      default: [],
    },

    buttonText: {
      type: String,
      default: "Learn More",
      trim: true,
      maxlength: 100,
    },

    buttonLink: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
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

serviceSchema.index({
  category: 1,
  isActive: 1,
  order: 1,
});

serviceSchema.index({
  isActive: 1,
  order: 1,
});

// ==========================================
// MODEL
// ==========================================

const Service =
  mongoose.models.Service ||
  mongoose.model("Service", serviceSchema);

module.exports = Service;