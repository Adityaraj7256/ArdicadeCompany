const mongoose = require("mongoose");

// ==========================================
// PROJECT GALLERY IMAGE
// ==========================================

const projectGallerySchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Gallery image URL is required"],
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

    caption: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// PROJECT FEATURE
// ==========================================

const projectFeatureSchema = new mongoose.Schema(
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

// ==========================================
// PROJECT SCHEMA
// ==========================================

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: [true, "Project slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },

    category: {
      type: String,
      required: [true, "Project category is required"],
      enum: [
        "technology",
        "construction",
        "infrastructure",
        "real-estate",
        "other",
      ],
    },

    client: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "planning",
        "ongoing",
        "completed",
        "on-hold",
        "cancelled",
      ],
      default: "planning",
    },

    startDate: {
      type: Date,
      default: null,
    },

    completionDate: {
      type: Date,
      default: null,
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
      maxlength: 10000,
      default: "",
    },

    // ==========================================
    // THUMBNAIL
    // ==========================================

    thumbnail: {
      url: {
        type: String,
        required: [true, "Project thumbnail URL is required"],
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

    // ==========================================
    // GALLERY
    // ==========================================

    gallery: {
      type: [projectGallerySchema],
      default: [],
    },

    // ==========================================
    // TECHNOLOGIES
    // ==========================================

    technologies: {
      type: [String],
      default: [],
    },

    // ==========================================
    // SERVICES
    // ==========================================

    services: {
      type: [String],
      default: [],
    },

    // ==========================================
    // FEATURES
    // ==========================================

    features: {
      type: [projectFeatureSchema],
      default: [],
    },

    // ==========================================
    // BUTTON
    // ==========================================

    buttonText: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "View Project",
    },

    buttonLink: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // ==========================================
    // STATUS FLAGS
    // ==========================================

    isFeatured: {
      type: Boolean,
      default: false,
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

projectSchema.index({
  category: 1,
  isActive: 1,
  order: 1,
});

projectSchema.index({
  status: 1,
  isActive: 1,
});

projectSchema.index({
  isFeatured: 1,
  isActive: 1,
});

projectSchema.index({
  order: 1,
});

// ==========================================
// MODEL
// ==========================================

// Prevent Mongoose OverwriteModelError
const Project =
  mongoose.models.Project ||
  mongoose.model("Project", projectSchema);

module.exports = Project;