const mongoose = require("mongoose");

// ==========================================
// ABOUT STATISTIC
// ==========================================

const aboutStatisticSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: [true, "Statistic value is required"],
      trim: true,
      maxlength: 50,
    },

    label: {
      type: String,
      required: [true, "Statistic label is required"],
      trim: true,
      maxlength: 100,
    },

    icon: {
      type: String,
      trim: true,
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
// ABOUT SCHEMA
// ==========================================

const aboutSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "About title is required"],
      trim: true,
      maxlength: 200,
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: 1000,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 15000,
      default: "",
    },

    image: {
      url: {
        type: String,
        required: [true, "About image URL is required"],
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

    vision: {
      title: {
        type: String,
        trim: true,
        default: "Our Vision",
      },

      description: {
        type: String,
        trim: true,
        maxlength: 3000,
        default: "",
      },
    },

    mission: {
      title: {
        type: String,
        trim: true,
        default: "Our Mission",
      },

      description: {
        type: String,
        trim: true,
        maxlength: 3000,
        default: "",
      },
    },

    values: {
      type: [
        {
          title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
          },

          description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
          },

          icon: {
            type: String,
            trim: true,
            default: "",
          },
        },
      ],
      default: [],
    },

    statistics: {
      type: [aboutStatisticSchema],
      default: [],
    },

    buttonText: {
      type: String,
      trim: true,
      default: "Learn More",
    },

    buttonLink: {
      type: String,
      trim: true,
      default: "/about",
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
// INDEX
// ==========================================

aboutSchema.index({
  isActive: 1,
});

const About = mongoose.model("About", aboutSchema);

module.exports = About;