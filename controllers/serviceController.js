const Service = require("../models/Service");

// ==========================================
// HELPER - NORMALIZE BOOLEAN
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
// PUBLIC - GET ACTIVE SERVICES
// ==========================================

const getActiveServices = async (req, res, next) => {
  try {
    const filter = {
      isActive: true,
    };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const services = await Service.find(filter)
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PUBLIC - GET SERVICE BY SLUG
// ==========================================

const getServiceBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Validate slug
    if (!slug || !slug.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service slug is required",
      });
    }

    const normalizedSlug = slug.toLowerCase().trim();

    const service = await Service.findOne({
      slug: normalizedSlug,
      isActive: true,
    }).lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET ALL SERVICES
// ==========================================

const getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find()
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET SINGLE SERVICE
// ==========================================

const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id).lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - CREATE SERVICE
// ==========================================

const createService = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      category,
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

    // ----------------------------------------
    // Required validation
    // ----------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service title is required",
      });
    }

    if (!slug || !slug.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service slug is required",
      });
    }

    if (
      !category ||
      ![
        "technology",
        "infrastructure",
        "construction",
      ].includes(category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid service category is required",
      });
    }

    if (!shortDescription || !shortDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Short description is required",
      });
    }

    if (
      !image ||
      typeof image !== "object" ||
      !image.url ||
      !image.url.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Service image URL is required",
      });
    }

    // ----------------------------------------
    // Check duplicate slug
    // ----------------------------------------

    const existingService = await Service.findOne({
      slug: slug.toLowerCase().trim(),
    });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message: "A service with this slug already exists",
      });
    }

    // ----------------------------------------
    // Validate order
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
          message: "Order must be a non-negative integer",
        });
      }
    }

    // ----------------------------------------
    // Create service
    // ----------------------------------------

    const service = await Service.create({
      title: title.trim(),

      slug: slug.toLowerCase().trim(),

      category,

      shortDescription: shortDescription.trim(),

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

      features:
        Array.isArray(features)
          ? features
          : [],

      buttonText:
        typeof buttonText === "string"
          ? buttonText.trim()
          : "Learn More",

      buttonLink:
        typeof buttonLink === "string"
          ? buttonLink.trim()
          : "",

      order: parsedOrder,

      // FIXED:
      // Boolean("false") was incorrectly returning true.
      isActive: normalizeBoolean(isActive, true),
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - UPDATE SERVICE
// ==========================================

const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const {
      title,
      slug,
      category,
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

    // ----------------------------------------
    // Title
    // ----------------------------------------

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Service title cannot be empty",
        });
      }

      service.title = title.trim();
    }

    // ----------------------------------------
    // Slug
    // ----------------------------------------

    if (slug !== undefined) {
      if (
        typeof slug !== "string" ||
        !slug.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Service slug cannot be empty",
        });
      }

      const normalizedSlug = slug.toLowerCase().trim();

      const existingService = await Service.findOne({
        slug: normalizedSlug,
        _id: {
          $ne: service._id,
        },
      });

      if (existingService) {
        return res.status(409).json({
          success: false,
          message: "A service with this slug already exists",
        });
      }

      service.slug = normalizedSlug;
    }

    // ----------------------------------------
    // Category
    // ----------------------------------------

    if (category !== undefined) {
      if (
        ![
          "technology",
          "infrastructure",
          "construction",
        ].includes(category)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid service category",
        });
      }

      service.category = category;
    }

    // ----------------------------------------
    // Short description
    // ----------------------------------------

    if (shortDescription !== undefined) {
      if (
        typeof shortDescription !== "string" ||
        !shortDescription.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Short description cannot be empty",
        });
      }

      service.shortDescription =
        shortDescription.trim();
    }

    // ----------------------------------------
    // Description
    // ----------------------------------------

    if (description !== undefined) {
      service.description =
        typeof description === "string"
          ? description.trim()
          : "";
    }

    // ----------------------------------------
    // Image
    // ----------------------------------------

    if (image !== undefined) {
      if (
        typeof image !== "object" ||
        !image.url ||
        !image.url.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid service image URL is required",
        });
      }

      service.image = {
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

    // ----------------------------------------
    // Icon
    // ----------------------------------------

    if (icon !== undefined) {
      service.icon =
        typeof icon === "string"
          ? icon.trim()
          : "";
    }

    // ----------------------------------------
    // Features
    // ----------------------------------------

    if (features !== undefined) {
      if (!Array.isArray(features)) {
        return res.status(400).json({
          success: false,
          message: "Features must be an array",
        });
      }

      service.features = features;
    }

    // ----------------------------------------
    // Button
    // ----------------------------------------

    if (buttonText !== undefined) {
      service.buttonText =
        typeof buttonText === "string"
          ? buttonText.trim()
          : "Learn More";
    }

    if (buttonLink !== undefined) {
      service.buttonLink =
        typeof buttonLink === "string"
          ? buttonLink.trim()
          : "";
    }

    // ----------------------------------------
    // Order
    // ----------------------------------------

    if (order !== undefined) {
      const parsedOrder = Number(order);

      if (
        !Number.isInteger(parsedOrder) ||
        parsedOrder < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Order must be a non-negative integer",
        });
      }

      service.order = parsedOrder;
    }

    // ----------------------------------------
    // Status
    // ----------------------------------------

    if (isActive !== undefined) {
      // FIXED:
      // Boolean("false") was incorrectly returning true.
      service.isActive = normalizeBoolean(
        isActive,
        service.isActive
      );
    }

    await service.save();

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - DELETE SERVICE
// ==========================================

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await Service.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - TOGGLE SERVICE STATUS
// ==========================================

const toggleServiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    service.isActive = !service.isActive;

    await service.save();

    return res.status(200).json({
      success: true,
      message: `Service ${
        service.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      service,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getActiveServices,
  getServiceBySlug,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
};