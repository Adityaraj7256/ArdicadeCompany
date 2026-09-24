const mongoose = require("mongoose");

const heroButtonSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    link: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    isExternal: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const heroSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Hero title is required"],
      trim: true,
      maxlength: 200,
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    image: {
      url: {
        type: String,
        required: [true, "Hero image URL is required"],
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

    buttonOne: {
      type: heroButtonSchema,
      default: null,
    },

    buttonTwo: {
      type: heroButtonSchema,
      default: null,
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

heroSchema.index({
  isActive: 1,
  order: 1,
});

heroSchema.index({
  order: 1,
});

// ==========================================
// MODEL
// ==========================================

const Hero = mongoose.model("Hero", heroSchema);

module.exports = Hero;