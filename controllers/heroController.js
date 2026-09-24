const mongoose = require("mongoose");
const Hero = require("../models/Hero");

// ======================================================
// VALIDATE MONGODB OBJECT ID
// ======================================================

const validateObjectId = (id) => {
  return mongoose.isValidObjectId(id);
};

// ======================================================
// NORMALIZE BOOLEAN
// ======================================================

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

// ======================================================
// PUBLIC - GET ACTIVE HEROES
// ======================================================

const getActiveHeroes = async (req, res, next) => {
  try {
    const heroes = await Hero.find({
      isActive: true,
    })
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: heroes.length,
      heroes,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// ADMIN - GET ALL HEROES
// ======================================================

const getAllHeroes = async (req, res, next) => {
  try {
    const heroes = await Hero.find()
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: heroes.length,
      heroes,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// ADMIN - GET SINGLE HERO
// ======================================================

const getHeroById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hero ID",
      });
    }

    const hero = await Hero.findById(id).lean();

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "Hero not found",
      });
    }

    return res.status(200).json({
      success: true,
      hero,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// ADMIN - CREATE HERO
// ======================================================

const createHero = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      description,
      image,
      buttonOne,
      buttonTwo,
      order,
      isActive,
    } = req.body;

    // ------------------------------------------
    // Required fields
    // ------------------------------------------

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Hero title is required",
      });
    }

    if (
      !image ||
      typeof image !== "object" ||
      Array.isArray(image) ||
      !image.url ||
      typeof image.url !== "string" ||
      !image.url.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Hero image URL is required",
      });
    }

    // ------------------------------------------
    // Validate button one
    // ------------------------------------------

    if (buttonOne !== undefined && buttonOne !== null) {
      if (
        typeof buttonOne !== "object" ||
        Array.isArray(buttonOne) ||
        typeof buttonOne.text !== "string" ||
        !buttonOne.text.trim() ||
        typeof buttonOne.link !== "string" ||
        !buttonOne.link.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Button One requires both text and link",
        });
      }
    }

    // ------------------------------------------
    // Validate button two
    // ------------------------------------------

    if (buttonTwo !== undefined && buttonTwo !== null) {
      if (
        typeof buttonTwo !== "object" ||
        Array.isArray(buttonTwo) ||
        typeof buttonTwo.text !== "string" ||
        !buttonTwo.text.trim() ||
        typeof buttonTwo.link !== "string" ||
        !buttonTwo.link.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Button Two requires both text and link",
        });
      }
    }

    // ------------------------------------------
    // Validate order
    // ------------------------------------------

    let parsedOrder = 0;

    if (order !== undefined) {
      parsedOrder = Number(order);

      if (
        !Number.isInteger(parsedOrder) ||
        parsedOrder < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order must be a non-negative integer",
        });
      }
    }

    // ------------------------------------------
    // Create hero
    // ------------------------------------------

    const hero = await Hero.create({
      title: title.trim(),

      subtitle:
        typeof subtitle === "string"
          ? subtitle.trim()
          : "",

      description:
        typeof description === "string"
          ? description.trim()
          : "",

      image: {
        url: image.url.trim(),

        publicId:
          typeof image.publicId === "string"
            ? image.publicId.trim()
            : "",

        altText:
          typeof image.altText === "string"
            ? image.altText.trim()
            : "",
      },

      buttonOne:
        buttonOne !== undefined &&
        buttonOne !== null
          ? {
              text: buttonOne.text.trim(),
              link: buttonOne.link.trim(),
            }
          : null,

      buttonTwo:
        buttonTwo !== undefined &&
        buttonTwo !== null
          ? {
              text: buttonTwo.text.trim(),
              link: buttonTwo.link.trim(),
            }
          : null,

      order: parsedOrder,

      isActive: normalizeBoolean(
        isActive,
        true
      ),
    });

    return res.status(201).json({
      success: true,
      message: "Hero created successfully",
      hero,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// ADMIN - UPDATE HERO
// ======================================================

const updateHero = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hero ID",
      });
    }

    const hero = await Hero.findById(id);

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "Hero not found",
      });
    }

    const {
      title,
      subtitle,
      description,
      image,
      buttonOne,
      buttonTwo,
      order,
      isActive,
    } = req.body;

    // ------------------------------------------
    // Update title
    // ------------------------------------------

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Hero title cannot be empty",
        });
      }

      hero.title = title.trim();
    }

    // ------------------------------------------
    // Update subtitle
    // ------------------------------------------

    if (subtitle !== undefined) {
      hero.subtitle =
        typeof subtitle === "string"
          ? subtitle.trim()
          : "";
    }

    // ------------------------------------------
    // Update description
    // ------------------------------------------

    if (description !== undefined) {
      hero.description =
        typeof description === "string"
          ? description.trim()
          : "";
    }

    // ------------------------------------------
    // Update image
    // ------------------------------------------

    if (image !== undefined) {
      if (
        !image ||
        typeof image !== "object" ||
        Array.isArray(image) ||
        !image.url ||
        typeof image.url !== "string" ||
        !image.url.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid hero image URL is required",
        });
      }

      hero.image = {
        url: image.url.trim(),

        publicId:
          typeof image.publicId === "string"
            ? image.publicId.trim()
            : "",

        altText:
          typeof image.altText === "string"
            ? image.altText.trim()
            : "",
      };
    }

    // ------------------------------------------
    // Update Button One
    // ------------------------------------------

    if (buttonOne !== undefined) {
      if (buttonOne === null) {
        hero.buttonOne = null;
      } else {
        if (
          typeof buttonOne !== "object" ||
          Array.isArray(buttonOne) ||
          typeof buttonOne.text !== "string" ||
          !buttonOne.text.trim() ||
          typeof buttonOne.link !== "string" ||
          !buttonOne.link.trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Button One requires both text and link",
          });
        }

        hero.buttonOne = {
          text: buttonOne.text.trim(),
          link: buttonOne.link.trim(),
        };
      }
    }

    // ------------------------------------------
    // Update Button Two
    // ------------------------------------------

    if (buttonTwo !== undefined) {
      if (buttonTwo === null) {
        hero.buttonTwo = null;
      } else {
        if (
          typeof buttonTwo !== "object" ||
          Array.isArray(buttonTwo) ||
          typeof buttonTwo.text !== "string" ||
          !buttonTwo.text.trim() ||
          typeof buttonTwo.link !== "string" ||
          !buttonTwo.link.trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Button Two requires both text and link",
          });
        }

        hero.buttonTwo = {
          text: buttonTwo.text.trim(),
          link: buttonTwo.link.trim(),
        };
      }
    }

    // ------------------------------------------
    // Update order
    // ------------------------------------------

    if (order !== undefined) {
      const parsedOrder = Number(order);

      if (
        !Number.isInteger(parsedOrder) ||
        parsedOrder < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order must be a non-negative integer",
        });
      }

      hero.order = parsedOrder;
    }

    // ------------------------------------------
    // Update active status
    // ------------------------------------------

    if (isActive !== undefined) {
      hero.isActive = normalizeBoolean(
        isActive,
        hero.isActive
      );
    }

    await hero.save();

    return res.status(200).json({
      success: true,
      message: "Hero updated successfully",
      hero,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// ADMIN - DELETE HERO
// ======================================================

const deleteHero = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hero ID",
      });
    }

    const hero = await Hero.findById(id);

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "Hero not found",
      });
    }

    await Hero.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Hero deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// ADMIN - TOGGLE HERO STATUS
// ======================================================

const toggleHeroStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hero ID",
      });
    }

    const hero = await Hero.findById(id);

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "Hero not found",
      });
    }

    hero.isActive = !hero.isActive;

    await hero.save();

    return res.status(200).json({
      success: true,
      message: `Hero ${
        hero.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      hero,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveHeroes,
  getAllHeroes,
  getHeroById,
  createHero,
  updateHero,
  deleteHero,
  toggleHeroStatus,
};