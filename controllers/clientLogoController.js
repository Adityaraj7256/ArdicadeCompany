const mongoose = require("mongoose");
const ClientLogo = require("../models/ClientLogo");

// ==========================================
// VALIDATE OBJECT ID
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
// PUBLIC - GET ACTIVE CLIENT LOGOS
// ==========================================

const getActiveClientLogos = async (
  req,
  res,
  next
) => {
  try {
    const filter = {
      isActive: true,
    };

    if (req.query.industry) {
      filter.industry = req.query.industry;
    }

    if (req.query.featured === "true") {
      filter.isFeatured = true;
    }

    const clientLogos =
      await ClientLogo.find(filter)
        .sort({
          order: 1,
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: clientLogos.length,
      clientLogos,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET ALL CLIENT LOGOS
// ==========================================

const getAllClientLogos = async (
  req,
  res,
  next
) => {
  try {
    const clientLogos =
      await ClientLogo.find()
        .sort({
          order: 1,
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: clientLogos.length,
      clientLogos,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET SINGLE CLIENT LOGO
// ==========================================

const getClientLogoById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client logo ID",
      });
    }

    const clientLogo =
      await ClientLogo.findById(id).lean();

    if (!clientLogo) {
      return res.status(404).json({
        success: false,
        message: "Client logo not found",
      });
    }

    return res.status(200).json({
      success: true,
      clientLogo,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - CREATE CLIENT LOGO
// ==========================================

const createClientLogo = async (
  req,
  res,
  next
) => {
  try {
    const {
      companyName,
      logo,
      website,
      industry,
      description,
      order,
      isFeatured,
      isActive,
    } = req.body;

    // ----------------------------------------
    // COMPANY NAME
    // ----------------------------------------

    if (
      !companyName ||
      typeof companyName !== "string" ||
      !companyName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    // ----------------------------------------
    // LOGO
    // ----------------------------------------

    if (
      !logo ||
      typeof logo !== "object" ||
      !logo.url ||
      typeof logo.url !== "string" ||
      !logo.url.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Logo URL is required",
      });
    }

    // ----------------------------------------
    // ORDER
    // ----------------------------------------

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

    // ----------------------------------------
    // CREATE
    // ----------------------------------------

    const clientLogo =
      await ClientLogo.create({
        companyName: companyName.trim(),

        logo: {
          url: logo.url.trim(),

          publicId:
            typeof logo.publicId === "string"
              ? logo.publicId.trim()
              : "",

          altText:
            typeof logo.altText === "string"
              ? logo.altText.trim()
              : "",
        },

        website:
          typeof website === "string"
            ? website.trim()
            : "",

        industry:
          typeof industry === "string"
            ? industry.trim()
            : "",

        description:
          typeof description === "string"
            ? description.trim()
            : "",

        order: parsedOrder,

        // FIXED
        isFeatured: normalizeBoolean(
          isFeatured,
          false
        ),

        // FIXED
        isActive: normalizeBoolean(
          isActive,
          true
        ),
      });

    return res.status(201).json({
      success: true,
      message:
        "Client logo created successfully",
      clientLogo,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - UPDATE CLIENT LOGO
// ==========================================

const updateClientLogo = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client logo ID",
      });
    }

    const clientLogo =
      await ClientLogo.findById(id);

    if (!clientLogo) {
      return res.status(404).json({
        success: false,
        message: "Client logo not found",
      });
    }

    const {
      companyName,
      logo,
      website,
      industry,
      description,
      order,
      isFeatured,
      isActive,
    } = req.body;

    // ----------------------------------------
    // COMPANY NAME
    // ----------------------------------------

    if (companyName !== undefined) {
      if (
        typeof companyName !== "string" ||
        !companyName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Company name cannot be empty",
        });
      }

      clientLogo.companyName =
        companyName.trim();
    }

    // ----------------------------------------
    // LOGO
    // ----------------------------------------

    if (logo !== undefined) {
      if (
        typeof logo !== "object" ||
        !logo.url ||
        typeof logo.url !== "string" ||
        !logo.url.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid logo URL is required",
        });
      }

      clientLogo.logo = {
        url: logo.url.trim(),

        publicId:
          typeof logo.publicId === "string"
            ? logo.publicId.trim()
            : "",

        altText:
          typeof logo.altText === "string"
            ? logo.altText.trim()
            : "",
      };
    }

    // ----------------------------------------
    // WEBSITE
    // ----------------------------------------

    if (website !== undefined) {
      clientLogo.website =
        typeof website === "string"
          ? website.trim()
          : "";
    }

    // ----------------------------------------
    // INDUSTRY
    // ----------------------------------------

    if (industry !== undefined) {
      clientLogo.industry =
        typeof industry === "string"
          ? industry.trim()
          : "";
    }

    // ----------------------------------------
    // DESCRIPTION
    // ----------------------------------------

    if (description !== undefined) {
      clientLogo.description =
        typeof description === "string"
          ? description.trim()
          : "";
    }

    // ----------------------------------------
    // ORDER
    // ----------------------------------------

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

      clientLogo.order = parsedOrder;
    }

    // ----------------------------------------
    // FEATURED
    // ----------------------------------------

    if (isFeatured !== undefined) {
      // FIXED
      clientLogo.isFeatured =
        normalizeBoolean(
          isFeatured,
          clientLogo.isFeatured
        );
    }

    // ----------------------------------------
    // ACTIVE
    // ----------------------------------------

    if (isActive !== undefined) {
      // FIXED
      clientLogo.isActive =
        normalizeBoolean(
          isActive,
          clientLogo.isActive
        );
    }

    await clientLogo.save();

    return res.status(200).json({
      success: true,
      message:
        "Client logo updated successfully",
      clientLogo,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - DELETE CLIENT LOGO
// ==========================================

const deleteClientLogo = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client logo ID",
      });
    }

    const clientLogo =
      await ClientLogo.findById(id);

    if (!clientLogo) {
      return res.status(404).json({
        success: false,
        message: "Client logo not found",
      });
    }

    await ClientLogo.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Client logo deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - TOGGLE STATUS
// ==========================================

const toggleClientLogoStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client logo ID",
      });
    }

    const clientLogo =
      await ClientLogo.findById(id);

    if (!clientLogo) {
      return res.status(404).json({
        success: false,
        message: "Client logo not found",
      });
    }

    clientLogo.isActive =
      !clientLogo.isActive;

    await clientLogo.save();

    return res.status(200).json({
      success: true,
      message: `Client logo ${
        clientLogo.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      clientLogo,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveClientLogos,
  getAllClientLogos,
  getClientLogoById,
  createClientLogo,
  updateClientLogo,
  deleteClientLogo,
  toggleClientLogoStatus,
};