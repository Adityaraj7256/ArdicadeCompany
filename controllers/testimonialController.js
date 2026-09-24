const mongoose = require("mongoose");
const Testimonial = require("../models/Testimonial");

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
// PUBLIC - GET ACTIVE TESTIMONIALS
// ==========================================

const getActiveTestimonials = async (
  req,
  res,
  next
) => {
  try {
    const filter = {
      isActive: true,
    };

    // Optional industry filter
    if (req.query.industry) {
      filter.industry = req.query.industry;
    }

    // Optional featured filter
    if (req.query.featured === "true") {
      filter.isFeatured = true;
    }

    const testimonials =
      await Testimonial.find(filter)
        .sort({
          order: 1,
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: testimonials.length,
      testimonials,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET ALL TESTIMONIALS
// ==========================================

const getAllTestimonials = async (
  req,
  res,
  next
) => {
  try {
    const testimonials =
      await Testimonial.find()
        .sort({
          order: 1,
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: testimonials.length,
      testimonials,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET SINGLE TESTIMONIAL
// ==========================================

const getTestimonialById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid testimonial ID",
      });
    }

    const testimonial =
      await Testimonial.findById(id).lean();

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    return res.status(200).json({
      success: true,
      testimonial,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - CREATE TESTIMONIAL
// ==========================================

const createTestimonial = async (
  req,
  res,
  next
) => {
  try {
    const {
      clientName,
      designation,
      companyName,
      testimonial,
      image,
      rating,
      website,
      industry,
      order,
      isFeatured,
      isActive,
    } = req.body;

    // ----------------------------------------
    // CLIENT NAME
    // ----------------------------------------

    if (
      !clientName ||
      typeof clientName !== "string" ||
      !clientName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Client name is required",
      });
    }

    // ----------------------------------------
    // TESTIMONIAL
    // ----------------------------------------

    if (
      !testimonial ||
      typeof testimonial !== "string" ||
      !testimonial.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Testimonial is required",
      });
    }

    // ----------------------------------------
    // RATING
    // ----------------------------------------

    let parsedRating = 5;

    if (rating !== undefined) {
      parsedRating = Number(rating);

      if (
        !Number.isInteger(parsedRating) ||
        parsedRating < 1 ||
        parsedRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be an integer between 1 and 5",
        });
      }
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
    // IMAGE
    // ----------------------------------------

    let formattedImage = {
      url: "",
      publicId: "",
      altText: "",
    };

    if (image !== undefined) {
      if (
        typeof image !== "object" ||
        Array.isArray(image)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid image object",
        });
      }

      formattedImage = {
        url:
          typeof image.url === "string"
            ? image.url.trim()
            : "",

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
    // CREATE
    // ----------------------------------------

    const newTestimonial =
      await Testimonial.create({
        clientName: clientName.trim(),

        designation:
          typeof designation === "string"
            ? designation.trim()
            : "",

        companyName:
          typeof companyName === "string"
            ? companyName.trim()
            : "",

        testimonial: testimonial.trim(),

        image: formattedImage,

        rating: parsedRating,

        website:
          typeof website === "string"
            ? website.trim()
            : "",

        industry:
          typeof industry === "string"
            ? industry.trim()
            : "",

        order: parsedOrder,

        // FIX: Boolean("false") issue
        isFeatured: normalizeBoolean(
          isFeatured,
          false
        ),

        // FIX: Boolean("false") issue
        isActive: normalizeBoolean(
          isActive,
          true
        ),
      });

    return res.status(201).json({
      success: true,
      message:
        "Testimonial created successfully",
      testimonial: newTestimonial,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - UPDATE TESTIMONIAL
// ==========================================

const updateTestimonial = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid testimonial ID",
      });
    }

    const testimonial =
      await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    const {
      clientName,
      designation,
      companyName,
      testimonial: testimonialText,
      image,
      rating,
      website,
      industry,
      order,
      isFeatured,
      isActive,
    } = req.body;

    // ----------------------------------------
    // CLIENT NAME
    // ----------------------------------------

    if (clientName !== undefined) {
      if (
        typeof clientName !== "string" ||
        !clientName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Client name cannot be empty",
        });
      }

      testimonial.clientName =
        clientName.trim();
    }

    // ----------------------------------------
    // DESIGNATION
    // ----------------------------------------

    if (designation !== undefined) {
      testimonial.designation =
        typeof designation === "string"
          ? designation.trim()
          : "";
    }

    // ----------------------------------------
    // COMPANY
    // ----------------------------------------

    if (companyName !== undefined) {
      testimonial.companyName =
        typeof companyName === "string"
          ? companyName.trim()
          : "";
    }

    // ----------------------------------------
    // TESTIMONIAL TEXT
    // ----------------------------------------

    if (testimonialText !== undefined) {
      if (
        typeof testimonialText !== "string" ||
        !testimonialText.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Testimonial cannot be empty",
        });
      }

      testimonial.testimonial =
        testimonialText.trim();
    }

    // ----------------------------------------
    // IMAGE
    // ----------------------------------------

    if (image !== undefined) {
      if (
        typeof image !== "object" ||
        Array.isArray(image)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid image object",
        });
      }

      testimonial.image = {
        url:
          typeof image.url === "string"
            ? image.url.trim()
            : "",

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
    // RATING
    // ----------------------------------------

    if (rating !== undefined) {
      const parsedRating = Number(rating);

      if (
        !Number.isInteger(parsedRating) ||
        parsedRating < 1 ||
        parsedRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be an integer between 1 and 5",
        });
      }

      testimonial.rating = parsedRating;
    }

    // ----------------------------------------
    // WEBSITE
    // ----------------------------------------

    if (website !== undefined) {
      testimonial.website =
        typeof website === "string"
          ? website.trim()
          : "";
    }

    // ----------------------------------------
    // INDUSTRY
    // ----------------------------------------

    if (industry !== undefined) {
      testimonial.industry =
        typeof industry === "string"
          ? industry.trim()
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

      testimonial.order = parsedOrder;
    }

    // ----------------------------------------
    // FEATURED
    // ----------------------------------------

    if (isFeatured !== undefined) {
      // FIX: Boolean("false") issue
      testimonial.isFeatured =
        normalizeBoolean(
          isFeatured,
          testimonial.isFeatured
        );
    }

    // ----------------------------------------
    // ACTIVE
    // ----------------------------------------

    if (isActive !== undefined) {
      // FIX: Boolean("false") issue
      testimonial.isActive =
        normalizeBoolean(
          isActive,
          testimonial.isActive
        );
    }

    await testimonial.save();

    return res.status(200).json({
      success: true,
      message:
        "Testimonial updated successfully",
      testimonial,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - DELETE TESTIMONIAL
// ==========================================

const deleteTestimonial = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid testimonial ID",
      });
    }

    const testimonial =
      await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await Testimonial.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Testimonial deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - TOGGLE STATUS
// ==========================================

const toggleTestimonialStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid testimonial ID",
      });
    }

    const testimonial =
      await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    testimonial.isActive =
      !testimonial.isActive;

    await testimonial.save();

    return res.status(200).json({
      success: true,
      message: `Testimonial ${
        testimonial.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      testimonial,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getActiveTestimonials,
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
};