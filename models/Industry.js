const mongoose = require("mongoose");

const industryFeatureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Feature title is required"],
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const industrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Industry title is required"],
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: [true, "Industry slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },

    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: 500,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    image: {
      url: {
        type: String,
        required: [true, "Industry image URL is required"],
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

    icon: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    features: {
      type: [industryFeatureSchema],
      default: [],
    },

    buttonText: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Explore Industry",
    },

    buttonLink: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
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

industrySchema.index({
  isActive: 1,
  order: 1,
});

industrySchema.index({
  order: 1,
});

const Industry = mongoose.model(
  "Industry",
  industrySchema
);

module.exports = Industry;