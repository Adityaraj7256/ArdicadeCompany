const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: [true, "Original file name is required"],
      trim: true,
      maxlength: 255,
    },

    fileName: {
      type: String,
      trim: true,
      default: "",
    },

    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
      trim: true,
      unique: true,
    },

    url: {
      type: String,
      required: [true, "Media URL is required"],
      trim: true,
    },

    secureUrl: {
      type: String,
      required: [true, "Secure media URL is required"],
      trim: true,
    },

    resourceType: {
      type: String,
      default: "image",
      enum: ["image", "video", "raw"],
    },

    format: {
      type: String,
      trim: true,
      default: "",
    },

    mimeType: {
      type: String,
      trim: true,
      default: "",
    },

    bytes: {
      type: Number,
      default: 0,
      min: 0,
    },

    width: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },

    folder: {
      type: String,
      trim: true,
      default: "general",
      maxlength: 100,
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
      maxlength: 500,
      default: "",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

mediaSchema.index({
  folder: 1,
  isActive: 1,
});

mediaSchema.index({
  createdAt: -1,
});

mediaSchema.index({
  originalName: 1,
});

const Media = mongoose.model("Media", mediaSchema);

module.exports = Media;