const Solution = require("../models/Solution");

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
// GET ACTIVE SOLUTIONS
// PUBLIC
// ==========================================

const getActiveSolutions = async (
  req,
  res,
  next
) => {
  try {
    const filter = {
      isActive: true,
    };

    if (req.query.category) {
      filter.category =
        req.query.category;
    }

    const solutions =
      await Solution.find(filter)
        .sort({
          order: 1,
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: solutions.length,
      solutions,
    });
  } catch (error) {
    console.error(
      "GET ACTIVE SOLUTIONS ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// GET SOLUTION BY SLUG
// PUBLIC
// ==========================================

const getSolutionBySlug = async (
  req,
  res,
  next
) => {
  try {
    const { slug } = req.params;

    if (!slug || !slug.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Solution slug is required",
      });
    }

    const solution =
      await Solution.findOne({
        slug: slug
          .toLowerCase()
          .trim(),
        isActive: true,
      }).lean();

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: "Solution not found",
      });
    }

    return res.status(200).json({
      success: true,
      solution,
    });
  } catch (error) {
    console.error(
      "GET SOLUTION BY SLUG ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// GET ALL SOLUTIONS
// ADMIN
// ==========================================

const getAllSolutions = async (
  req,
  res,
  next
) => {
  try {
    const solutions =
      await Solution.find()
        .sort({
          order: 1,
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: solutions.length,
      solutions,
    });
  } catch (error) {
    console.error(
      "GET ALL SOLUTIONS ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// GET SOLUTION BY ID
// ADMIN
// ==========================================

const getSolutionById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const solution =
      await Solution.findById(id).lean();

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: "Solution not found",
      });
    }

    return res.status(200).json({
      success: true,
      solution,
    });
  } catch (error) {
    console.error(
      "GET SOLUTION BY ID ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// CREATE SOLUTION
// ADMIN
// ==========================================

const createSolution = async (
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
      category,
      image,
      features,
      benefits,
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
        message:
          "Solution title is required",
      });
    }

    if (
      !slug ||
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Solution slug is required",
      });
    }

    if (
      !shortDescription ||
      typeof shortDescription !==
        "string" ||
      !shortDescription.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Short description is required",
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
        message:
          "Solution image URL is required",
      });
    }

    if (
      features !== undefined &&
      !Array.isArray(features)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Features must be an array",
      });
    }

    if (
      benefits !== undefined &&
      !Array.isArray(benefits)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Benefits must be an array",
      });
    }

    const normalizedSlug =
      slug
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

    const existing =
      await Solution.findOne({
        slug: normalizedSlug,
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "A solution with this slug already exists",
      });
    }

    const solution =
      await Solution.create({
        title: title.trim(),

        slug: normalizedSlug,

        shortDescription:
          shortDescription.trim(),

        description:
          typeof description === "string"
            ? description.trim()
            : "",

        category:
          category || "business",

        image: {
          url: image.url.trim(),

          publicId:
            typeof image.publicId ===
            "string"
              ? image.publicId.trim()
              : "",

          altText:
            typeof image.altText ===
            "string"
              ? image.altText.trim()
              : "",
        },

        features:
          Array.isArray(features)
            ? features
            : [],

        benefits:
          Array.isArray(benefits)
            ? benefits
            : [],

        buttonText:
          typeof buttonText === "string"
            ? buttonText.trim()
            : "Learn More",

        buttonLink:
          typeof buttonLink === "string"
            ? buttonLink.trim()
            : "/contact",

        order:
          Number.isFinite(Number(order))
            ? Number(order)
            : 0,

        // FIXED:
        // Boolean("false") was returning true.
        isActive: normalizeBoolean(
          isActive,
          true
        ),
      });

    return res.status(201).json({
      success: true,
      message:
        "Solution created successfully",
      solution,
    });
  } catch (error) {
    console.error(
      "CREATE SOLUTION ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// UPDATE SOLUTION
// ADMIN
// ==========================================

const updateSolution = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const solution =
      await Solution.findById(id);

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: "Solution not found",
      });
    }

    const {
      title,
      slug,
      shortDescription,
      description,
      category,
      image,
      features,
      benefits,
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
            "Title cannot be empty",
        });
      }

      solution.title =
        title.trim();
    }

    if (slug !== undefined) {
      if (
        typeof slug !== "string" ||
        !slug.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Slug cannot be empty",
        });
      }

      const normalizedSlug =
        slug
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-");

      const existing =
        await Solution.findOne({
          slug: normalizedSlug,
          _id: {
            $ne: solution._id,
          },
        });

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "A solution with this slug already exists",
        });
      }

      solution.slug =
        normalizedSlug;
    }

    if (
      shortDescription !==
      undefined
    ) {
      if (
        typeof shortDescription !==
          "string" ||
        !shortDescription.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Short description cannot be empty",
        });
      }

      solution.shortDescription =
        shortDescription.trim();
    }

    if (
      description !== undefined
    ) {
      solution.description =
        typeof description === "string"
          ? description.trim()
          : "";
    }

    if (category !== undefined) {
      solution.category =
        category;
    }

    if (image !== undefined) {
      if (
        !image ||
        typeof image !== "object" ||
        !image.url ||
        !image.url.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid image URL is required",
        });
      }

      solution.image = {
        url: image.url.trim(),

        publicId:
          typeof image.publicId ===
          "string"
            ? image.publicId.trim()
            : "",

        altText:
          typeof image.altText ===
          "string"
            ? image.altText.trim()
            : "",
      };
    }

    if (
      features !== undefined
    ) {
      if (
        !Array.isArray(features)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Features must be an array",
        });
      }

      solution.features =
        features;
    }

    if (
      benefits !== undefined
    ) {
      if (
        !Array.isArray(benefits)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Benefits must be an array",
        });
      }

      solution.benefits =
        benefits;
    }

    if (
      buttonText !== undefined
    ) {
      solution.buttonText =
        typeof buttonText ===
        "string"
          ? buttonText.trim()
          : "Learn More";
    }

    if (
      buttonLink !== undefined
    ) {
      solution.buttonLink =
        typeof buttonLink ===
        "string"
          ? buttonLink.trim()
          : "/contact";
    }

    if (order !== undefined) {
      solution.order =
        Number.isFinite(
          Number(order)
        )
          ? Number(order)
          : 0;
    }

    if (
      isActive !== undefined
    ) {
      // FIXED:
      // Boolean("false") was returning true.
      solution.isActive =
        normalizeBoolean(
          isActive,
          solution.isActive
        );
    }

    await solution.save();

    return res.status(200).json({
      success: true,
      message:
        "Solution updated successfully",
      solution,
    });
  } catch (error) {
    console.error(
      "UPDATE SOLUTION ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// DELETE SOLUTION
// ADMIN
// ==========================================

const deleteSolution = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const solution =
      await Solution.findById(id);

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: "Solution not found",
      });
    }

    await Solution.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Solution deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE SOLUTION ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// TOGGLE STATUS
// ADMIN
// ==========================================

const toggleSolutionStatus =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const solution =
        await Solution.findById(id);

      if (!solution) {
        return res.status(404).json({
          success: false,
          message:
            "Solution not found",
        });
      }

      solution.isActive =
        !solution.isActive;

      await solution.save();

      return res.status(200).json({
        success: true,
        message: `Solution ${
          solution.isActive
            ? "activated"
            : "deactivated"
        } successfully`,
        solution,
      });
    } catch (error) {
      console.error(
        "TOGGLE SOLUTION ERROR:",
        error
      );

      next(error);
    }
  };

module.exports = {
  getActiveSolutions,
  getSolutionBySlug,
  getAllSolutions,
  getSolutionById,
  createSolution,
  updateSolution,
  deleteSolution,
  toggleSolutionStatus,
};