const About = require("../models/About");

// ==========================================
// HELPERS
// ==========================================

const safeString = (value, fallback = "") => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "number") {
    return String(value).trim();
  }

  return fallback;
};

// ------------------------------------------
// Normalize Boolean
// ------------------------------------------

const normalizeBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return fallback;
};

// ------------------------------------------
// Normalize Vision / Mission
// ------------------------------------------

const normalizeSection = (value, defaultTitle) => {
  // Frontend string:
  // "Our vision..."

  if (typeof value === "string") {
    return {
      title: defaultTitle,
      description: value.trim(),
    };
  }

  // Backend/object format:
  // {
  //   title: "...",
  //   description: "..."
  // }

  if (value && typeof value === "object") {
    return {
      title:
        safeString(value.title, defaultTitle) ||
        defaultTitle,

      description: safeString(value.description),
    };
  }

  return {
    title: defaultTitle,
    description: "",
  };
};

// ------------------------------------------
// Normalize Values
// ------------------------------------------

const normalizeValues = (values) => {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((value) => {
    if (value && typeof value === "object") {
      return {
        title: safeString(value.title),
        description: safeString(value.description),
      };
    }

    return {
      title: safeString(value),
      description: "",
    };
  });
};

// ------------------------------------------
// Normalize Statistics
// ------------------------------------------

const normalizeStatistics = (statistics) => {
  if (!Array.isArray(statistics)) {
    return [];
  }

  return statistics.map((stat) => {
    if (stat && typeof stat === "object") {
      return {
        value: safeString(stat.value),
        label: safeString(stat.label),
      };
    }

    return {
      value: safeString(stat),
      label: "",
    };
  });
};

// ==========================================
// GET ACTIVE ABOUT
// PUBLIC
// ==========================================

const getActiveAbout = async (req, res, next) => {
  try {
    const about = await About.findOne({
      isActive: true,
    }).lean();

    if (!about) {
      return res.status(404).json({
        success: false,
        message: "About content not found",
      });
    }

    return res.status(200).json({
      success: true,
      about,
    });
  } catch (error) {
    console.error("GET ACTIVE ABOUT ERROR:", error);

    next(error);
  }
};

// ==========================================
// GET ALL ABOUT
// ADMIN
// ==========================================

const getAllAbout = async (req, res, next) => {
  try {
    const about = await About.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: about.length,
      about,
    });
  } catch (error) {
    console.error("GET ALL ABOUT ERROR:", error);

    next(error);
  }
};

// ==========================================
// GET SINGLE ABOUT
// ADMIN
// ==========================================

const getAboutById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const about = await About.findById(id).lean();

    if (!about) {
      return res.status(404).json({
        success: false,
        message: "About content not found",
      });
    }

    return res.status(200).json({
      success: true,
      about,
    });
  } catch (error) {
    console.error("GET ABOUT BY ID ERROR:", error);

    next(error);
  }
};

// ==========================================
// CREATE ABOUT
// ADMIN
// ==========================================

const createAbout = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      shortDescription,
      description,
      image,
      vision,
      mission,
      values,
      statistics,
      buttonText,
      buttonLink,
      isActive,
    } = req.body;

    // ----------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------

    const cleanTitle = safeString(title);

    const cleanShortDescription =
      safeString(shortDescription);

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message: "About title is required",
      });
    }

    if (!cleanShortDescription) {
      return res.status(400).json({
        success: false,
        message: "Short description is required",
      });
    }

    // ----------------------------------------
    // IMAGE
    // ----------------------------------------

    if (
      !image ||
      typeof image !== "object" ||
      !safeString(image.url)
    ) {
      return res.status(400).json({
        success: false,
        message: "About image URL is required",
      });
    }

    // ----------------------------------------
    // ACTIVE CHECK
    // ----------------------------------------

    const normalizedIsActive = normalizeBoolean(
      isActive,
      true
    );

    if (normalizedIsActive) {
      const existingActiveAbout =
        await About.findOne({
          isActive: true,
        });

      if (existingActiveAbout) {
        return res.status(409).json({
          success: false,
          message:
            "An active About section already exists",
        });
      }
    }

    // ----------------------------------------
    // ARRAYS
    // ----------------------------------------

    if (
      values !== undefined &&
      !Array.isArray(values)
    ) {
      return res.status(400).json({
        success: false,
        message: "Values must be an array",
      });
    }

    if (
      statistics !== undefined &&
      !Array.isArray(statistics)
    ) {
      return res.status(400).json({
        success: false,
        message: "Statistics must be an array",
      });
    }

    // ----------------------------------------
    // CREATE
    // ----------------------------------------

    const about = await About.create({
      title: cleanTitle,

      subtitle: safeString(subtitle),

      shortDescription: cleanShortDescription,

      description: safeString(description),

      image: {
        url: safeString(image.url),

        publicId: safeString(image.publicId),

        altText: safeString(image.altText),
      },

      vision: normalizeSection(
        vision,
        "Our Vision"
      ),

      mission: normalizeSection(
        mission,
        "Our Mission"
      ),

      values: normalizeValues(values),

      statistics: normalizeStatistics(
        statistics
      ),

      buttonText:
        safeString(
          buttonText,
          "Learn More"
        ) || "Learn More",

      buttonLink:
        safeString(
          buttonLink,
          "/contact"
        ) || "/contact",

      // FIX: properly handle boolean/string boolean
      isActive: normalizedIsActive,
    });

    return res.status(201).json({
      success: true,
      message:
        "About content created successfully",
      about,
    });
  } catch (error) {
    console.error(
      "CREATE ABOUT ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// UPDATE ABOUT
// ADMIN
// ==========================================

const updateAbout = async (req, res, next) => {
  try {
    const { id } = req.params;

    const about = await About.findById(id);

    if (!about) {
      return res.status(404).json({
        success: false,
        message: "About content not found",
      });
    }

    const {
      title,
      subtitle,
      shortDescription,
      description,
      image,
      vision,
      mission,
      values,
      statistics,
      buttonText,
      buttonLink,
      isActive,
    } = req.body;

    // ----------------------------------------
    // TITLE
    // ----------------------------------------

    if (title !== undefined) {
      const cleanTitle = safeString(title);

      if (!cleanTitle) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      about.title = cleanTitle;
    }

    // ----------------------------------------
    // SUBTITLE
    // ----------------------------------------

    if (subtitle !== undefined) {
      about.subtitle = safeString(subtitle);
    }

    // ----------------------------------------
    // SHORT DESCRIPTION
    // ----------------------------------------

    if (
      shortDescription !==
      undefined
    ) {
      const cleanShortDescription =
        safeString(shortDescription);

      if (!cleanShortDescription) {
        return res.status(400).json({
          success: false,
          message:
            "Short description cannot be empty",
        });
      }

      about.shortDescription =
        cleanShortDescription;
    }

    // ----------------------------------------
    // DESCRIPTION
    // ----------------------------------------

    if (description !== undefined) {
      about.description =
        safeString(description);
    }

    // ----------------------------------------
    // IMAGE
    // ----------------------------------------

    if (image !== undefined) {
      if (
        !image ||
        typeof image !== "object" ||
        !safeString(image.url)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid image URL is required",
        });
      }

      about.image = {
        url: safeString(image.url),

        publicId: safeString(
          image.publicId
        ),

        altText: safeString(
          image.altText
        ),
      };
    }

    // ----------------------------------------
    // VISION
    // ----------------------------------------

    if (vision !== undefined) {
      about.vision =
        normalizeSection(
          vision,
          "Our Vision"
        );
    }

    // ----------------------------------------
    // MISSION
    // ----------------------------------------

    if (mission !== undefined) {
      about.mission =
        normalizeSection(
          mission,
          "Our Mission"
        );
    }

    // ----------------------------------------
    // VALUES
    // ----------------------------------------

    if (values !== undefined) {
      if (!Array.isArray(values)) {
        return res.status(400).json({
          success: false,
          message:
            "Values must be an array",
        });
      }

      about.values =
        normalizeValues(values);
    }

    // ----------------------------------------
    // STATISTICS
    // ----------------------------------------

    if (statistics !== undefined) {
      if (!Array.isArray(statistics)) {
        return res.status(400).json({
          success: false,
          message:
            "Statistics must be an array",
        });
      }

      about.statistics =
        normalizeStatistics(
          statistics
        );
    }

    // ----------------------------------------
    // BUTTON TEXT
    // ----------------------------------------

    if (buttonText !== undefined) {
      about.buttonText =
        safeString(
          buttonText,
          "Learn More"
        ) || "Learn More";
    }

    // ----------------------------------------
    // BUTTON LINK
    // ----------------------------------------

    if (buttonLink !== undefined) {
      about.buttonLink =
        safeString(
          buttonLink,
          "/contact"
        ) || "/contact";
    }

    // ----------------------------------------
    // ACTIVE STATUS
    // ----------------------------------------

    if (isActive !== undefined) {
      // FIX: correctly handle true/false strings
      const normalizedIsActive =
        normalizeBoolean(
          isActive,
          about.isActive
        );

      if (normalizedIsActive === true) {
        const existingActiveAbout =
          await About.findOne({
            isActive: true,
            _id: {
              $ne: about._id,
            },
          });

        if (existingActiveAbout) {
          return res.status(409).json({
            success: false,
            message:
              "Another active About section already exists",
          });
        }
      }

      about.isActive =
        normalizedIsActive;
    }

    // ----------------------------------------
    // SAVE
    // ----------------------------------------

    await about.save();

    return res.status(200).json({
      success: true,
      message:
        "About content updated successfully",
      about,
    });
  } catch (error) {
    // IMPORTANT:
    // Log actual Mongoose error in terminal

    console.error(
      "=========================================="
    );

    console.error(
      "UPDATE ABOUT ERROR"
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Name:",
      error.name
    );

    console.error(
      "Stack:",
      error.stack
    );

    console.error(
      "=========================================="
    );

    next(error);
  }
};

// ==========================================
// DELETE ABOUT
// ADMIN
// ==========================================

const deleteAbout = async (req, res, next) => {
  try {
    const { id } = req.params;

    const about = await About.findById(id);

    if (!about) {
      return res.status(404).json({
        success: false,
        message: "About content not found",
      });
    }

    await About.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "About content deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ABOUT ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// TOGGLE STATUS
// ADMIN
// ==========================================

const toggleAboutStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const about = await About.findById(id);

    if (!about) {
      return res.status(404).json({
        success: false,
        message: "About content not found",
      });
    }

    if (!about.isActive) {
      const existingActiveAbout =
        await About.findOne({
          isActive: true,
          _id: {
            $ne: about._id,
          },
        });

      if (existingActiveAbout) {
        return res.status(409).json({
          success: false,
          message:
            "Another About section is already active",
        });
      }
    }

    about.isActive = !about.isActive;

    await about.save();

    return res.status(200).json({
      success: true,
      message: `About section ${
        about.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      about,
    });
  } catch (error) {
    console.error(
      "TOGGLE ABOUT ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getActiveAbout,
  getAllAbout,
  getAboutById,
  createAbout,
  updateAbout,
  deleteAbout,
  toggleAboutStatus,
};