const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const solutionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "business",
        "enterprise",
        "digital-transformation",
        "software",
        "infrastructure",
        "other",
      ],
      default: "business",
    },

    image: {
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

    features: {
      type: [featureSchema],
      default: [],
    },

    benefits: {
      type: [featureSchema],
      default: [],
    },

    buttonText: {
      type: String,
      default: "Learn More",
      trim: true,
    },

    buttonLink: {
      type: String,
      default: "/contact",
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
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

solutionSchema.index({
  isActive: 1,
  order: 1,
});

solutionSchema.index({
  category: 1,
});

module.exports = mongoose.model(
  "Solution",
  solutionSchema
);