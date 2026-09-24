const mongoose = require("mongoose");

// ==========================================
// INSIGHT / BLOG SCHEMA
// ==========================================

const insightSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 250,
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 300,
    },

    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: 500,
    },

    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },

    featuredImage: {
      url: {
        type: String,
        required: [true, "Featured image URL is required"],
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

    author: {
      name: {
        type: String,
        trim: true,
        maxlength: 150,
        default: "",
      },

      designation: {
        type: String,
        trim: true,
        maxlength: 150,
        default: "",
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
      },
    },

    category: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    seo: {
      title: {
        type: String,
        trim: true,
        maxlength: 250,
        default: "",
      },

      description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      keywords: {
        type: [String],
        default: [],
      },
    },

    readTime: {
      type: Number,
      min: 1,
      default: 5,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

insightSchema.index({
  status: 1,
  isActive: 1,
  publishedAt: -1,
});

insightSchema.index({
  isFeatured: 1,
  status: 1,
  isActive: 1,
});

insightSchema.index({
  category: 1,
  status: 1,
  isActive: 1,
});

insightSchema.index({
  order: 1,
});

insightSchema.index({
  slug: 1,
});

// ==========================================
// MODEL
// ==========================================

const Insight = mongoose.model(
  "Insight",
  insightSchema
);

module.exports = Insight;