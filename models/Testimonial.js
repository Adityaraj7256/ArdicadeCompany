const mongoose = require("mongoose");

// ==========================================
// TESTIMONIAL SCHEMA
// ==========================================

const testimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      maxlength: 150,
    },

    designation: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    companyName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    testimonial: {
      type: String,
      required: [true, "Testimonial is required"],
      trim: true,
      maxlength: 3000,
    },

    image: {
      url: {
        type: String,
        trim: true,
        default: "",
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

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
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

testimonialSchema.index({
  isActive: 1,
  order: 1,
});

testimonialSchema.index({
  isFeatured: 1,
  isActive: 1,
});

testimonialSchema.index({
  industry: 1,
  isActive: 1,
});

// ==========================================
// MODEL
// ==========================================

const Testimonial = mongoose.model(
  "Testimonial",
  testimonialSchema
);

module.exports = Testimonial;