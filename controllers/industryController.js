const mongoose = require("mongoose");
const Industry = require("../models/Industry");

// ==========================================
// VALIDATE MONGODB OBJECT ID
// ==========================================

const validateObjectId = (id) => {
  return mongoose.isValidObjectId(id);
};

// ==========================================
// NORMALIZE BOOLEAN
// ==========================================

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

// ==========================================
// PUBLIC - GET ACTIVE INDUSTRIES
// ==========================================

const getActiveIndustries = async (
  req,
  res,
  next
) => {
  try {
    const industries = await Industry.find({
      isActive: true,
    })
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: industries.length,
      industries,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PUBLIC - GET ACTIVE INDUSTRY BY SLUG
// ==========================================

const getIndustryBySlug = async (
  req,
  res,
  next
) => {
  try {
    const { slug } = req.params;

    if (
      !slug ||
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Industry slug is required",
      });
    }

    const normalizedSlug = slug
      .toLowerCase()
      .trim();

    const industry = await Industry.findOne({
      slug: normalizedSlug,
      isActive: true,
    }).lean();

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: "Industry not found",
      });
    }

    return res.status(200).json({
      success: true,
      industry,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET ALL INDUSTRIES
// ==========================================

const getAllIndustries = async (
  req,
  res,
  next
) => {
  try {
    const industries = await Industry.find()
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: industries.length,
      industries,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET SINGLE INDUSTRY
// ==========================================

const getIndustryById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid industry ID",
      });
    }

    const industry =
      await Industry.findById(id).lean();

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: "Industry not found",
      });
    }

    return res.status(200).json({
      success: true,
      industry,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - CREATE INDUSTRY
// ==========================================

const createIndustry = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      description,
      image,
      icon,
      features,
      buttonText,
      buttonLink,
      order,
      isActive,
    } = req.body;

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Industry title is required",
      });
    }

    if (
      !slug ||
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Industry slug is required",
      });
    }

    if (
      !shortDescription ||
      typeof shortDescription !== "string" ||
      !shortDescription.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Short description is required",
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
        message: "Industry image URL is required",
      });
    }

    const normalizedSlug = slug
      .toLowerCase()
      .trim();

    const existingIndustry =
      await Industry.findOne({
        slug: normalizedSlug,
      });

    if (existingIndustry) {
      return res.status(409).json({
        success: false,
        message:
          "An industry with this slug already exists",
      });
    }

    if (
      features !== undefined &&
      !Array.isArray(features)
    ) {
      return res.status(400).json({
        success: false,
        message: "Features must be an array",
      });
    }

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

    const industry = await Industry.create({
      title: title.trim(),

      slug: normalizedSlug,

      shortDescription:
        shortDescription.trim(),

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

      icon:
        typeof icon === "string"
          ? icon.trim()
          : "",

      features: Array.isArray(features)
        ? features
        : [],

      buttonText:
        typeof buttonText === "string"
          ? buttonText.trim()
          : "Explore Industry",

      buttonLink:
        typeof buttonLink === "string"
          ? buttonLink.trim()
          : "",

      order: parsedOrder,

      isActive: normalizeBoolean(
        isActive,
        true
      ),
    });

    return res.status(201).json({
      success: true,
      message:
        "Industry created successfully",
      industry,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - UPDATE INDUSTRY
// ==========================================

const updateIndustry = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid industry ID",
      });
    }

    const industry =
      await Industry.findById(id);

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: "Industry not found",
      });
    }

    const {
      title,
      slug,
      shortDescription,
      description,
      image,
      icon,
      features,
      buttonText,
      buttonLink,
      order,
      isActive,
    } = req.body;

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Industry title cannot be empty",
        });
      }

      industry.title = title.trim();
    }

    if (slug !== undefined) {
      if (
        typeof slug !== "string" ||
        !slug.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Industry slug cannot be empty",
        });
      }

      const normalizedSlug =
        slug.toLowerCase().trim();

      const existingIndustry =
        await Industry.findOne({
          slug: normalizedSlug,
          _id: {
            $ne: industry._id,
          },
        });

      if (existingIndustry) {
        return res.status(409).json({
          success: false,
          message:
            "An industry with this slug already exists",
        });
      }

      industry.slug = normalizedSlug;
    }

    if (shortDescription !== undefined) {
      if (
        typeof shortDescription !== "string" ||
        !shortDescription.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Short description cannot be empty",
        });
      }

      industry.shortDescription =
        shortDescription.trim();
    }

    if (description !== undefined) {
      industry.description =
        typeof description === "string"
          ? description.trim()
          : "";
    }

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
            "Valid industry image URL is required",
        });
      }

      industry.image = {
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

    if (icon !== undefined) {
      industry.icon =
        typeof icon === "string"
          ? icon.trim()
          : "";
    }

    if (features !== undefined) {
      if (!Array.isArray(features)) {
        return res.status(400).json({
          success: false,
          message:
            "Features must be an array",
        });
      }

      industry.features = features;
    }

    if (buttonText !== undefined) {
      industry.buttonText =
        typeof buttonText === "string"
          ? buttonText.trim()
          : "Explore Industry";
    }

    if (buttonLink !== undefined) {
      industry.buttonLink =
        typeof buttonLink === "string"
          ? buttonLink.trim()
          : "";
    }

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

      industry.order = parsedOrder;
    }

    if (isActive !== undefined) {
      industry.isActive = normalizeBoolean(
        isActive,
        industry.isActive
      );
    }

    await industry.save();

    return res.status(200).json({
      success: true,
      message:
        "Industry updated successfully",
      industry,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - DELETE INDUSTRY
// ==========================================

const deleteIndustry = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid industry ID",
      });
    }

    const industry =
      await Industry.findById(id);

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: "Industry not found",
      });
    }

    await Industry.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Industry deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - TOGGLE INDUSTRY STATUS
// ==========================================

const toggleIndustryStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid industry ID",
      });
    }

    const industry =
      await Industry.findById(id);

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: "Industry not found",
      });
    }

    industry.isActive =
      !industry.isActive;

    await industry.save();

    return res.status(200).json({
      success: true,
      message: `Industry ${
        industry.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      industry,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  getActiveIndustries,
  getIndustryBySlug,
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  toggleIndustryStatus,
};