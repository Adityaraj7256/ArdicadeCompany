const mongoose = require("mongoose");
const Insight = require("../models/Insight");

// ==========================================
// SLUG GENERATOR
// ==========================================

const generateSlug = (value) => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// ==========================================
// OBJECT ID VALIDATION
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
// PUBLIC - GET PUBLISHED INSIGHTS
// ==========================================

const getPublishedInsights = async (
  req,
  res,
  next
) => {
  try {
    const filter = {
      status: "published",
      isActive: true,
    };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.featured === "true") {
      filter.isFeatured = true;
    }

    const insights =
      await Insight.find(filter)
        .sort({
          publishedAt: -1,
          order: 1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: insights.length,
      insights,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PUBLIC - GET SINGLE INSIGHT BY SLUG
// ==========================================

const getPublishedInsightBySlug = async (
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
        message: "Insight slug is required",
      });
    }

    const normalizedSlug = generateSlug(slug);

    if (!normalizedSlug) {
      return res.status(400).json({
        success: false,
        message: "Invalid insight slug",
      });
    }

    const insight =
      await Insight.findOne({
        slug: normalizedSlug,
        status: "published",
        isActive: true,
      }).lean();

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: "Insight not found",
      });
    }

    return res.status(200).json({
      success: true,
      insight,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET ALL INSIGHTS
// ==========================================

const getAllInsights = async (
  req,
  res,
  next
) => {
  try {
    const insights =
      await Insight.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: insights.length,
      insights,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET SINGLE INSIGHT
// ==========================================

const getInsightById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid insight ID",
      });
    }

    const insight =
      await Insight.findById(id).lean();

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: "Insight not found",
      });
    }

    return res.status(200).json({
      success: true,
      insight,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - CREATE INSIGHT
// ==========================================

const createInsight = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      content,
      featuredImage,
      author,
      category,
      tags,
      seo,
      readTime,
      status,
      publishedAt,
      isFeatured,
      isActive,
      order,
    } = req.body;

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (
      !shortDescription ||
      typeof shortDescription !== "string" ||
      !shortDescription.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Short description is required",
      });
    }

    if (
      !content ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    if (
      !featuredImage ||
      typeof featuredImage !== "object" ||
      Array.isArray(featuredImage) ||
      !featuredImage.url ||
      typeof featuredImage.url !== "string" ||
      !featuredImage.url.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Featured image URL is required",
      });
    }

    const finalSlug = generateSlug(
      slug || title
    );

    if (!finalSlug) {
      return res.status(400).json({
        success: false,
        message: "Valid slug is required",
      });
    }

    const existingSlug =
      await Insight.findOne({
        slug: finalSlug,
      });

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message:
          "An insight with this slug already exists",
      });
    }

    const finalStatus =
      status || "draft";

    if (
      !["draft", "published"].includes(
        finalStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be draft or published",
      });
    }

    let finalPublishedAt =
      publishedAt || null;

    if (finalStatus === "published") {
      finalPublishedAt =
        publishedAt || new Date();
    }

    let finalReadTime = 5;

    if (readTime !== undefined) {
      finalReadTime = Number(readTime);

      if (
        !Number.isInteger(finalReadTime) ||
        finalReadTime < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Read time must be a positive integer",
        });
      }
    }

    let finalOrder = 0;

    if (order !== undefined) {
      finalOrder = Number(order);

      if (
        !Number.isInteger(finalOrder) ||
        finalOrder < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order must be a non-negative integer",
        });
      }
    }

    if (
      tags !== undefined &&
      !Array.isArray(tags)
    ) {
      return res.status(400).json({
        success: false,
        message: "Tags must be an array",
      });
    }

    if (
      author !== undefined &&
      author !== null &&
      typeof author !== "object"
    ) {
      return res.status(400).json({
        success: false,
        message: "Author must be an object",
      });
    }

    if (
      seo !== undefined &&
      seo !== null &&
      typeof seo !== "object"
    ) {
      return res.status(400).json({
        success: false,
        message: "SEO must be an object",
      });
    }

    const insight =
      await Insight.create({
        title: title.trim(),

        slug: finalSlug,

        shortDescription:
          shortDescription.trim(),

        content: content.trim(),

        featuredImage: {
          url: featuredImage.url.trim(),

          publicId:
            typeof featuredImage.publicId ===
            "string"
              ? featuredImage.publicId.trim()
              : "",

          altText:
            typeof featuredImage.altText ===
            "string"
              ? featuredImage.altText.trim()
              : "",
        },

        author: {
          name:
            author &&
            typeof author.name === "string"
              ? author.name.trim()
              : "",

          designation:
            author &&
            typeof author.designation ===
              "string"
              ? author.designation.trim()
              : "",

          image: {
            url:
              author &&
              author.image &&
              typeof author.image.url ===
                "string"
                ? author.image.url.trim()
                : "",

            publicId:
              author &&
              author.image &&
              typeof author.image.publicId ===
                "string"
                ? author.image.publicId.trim()
                : "",
          },
        },

        category:
          typeof category === "string"
            ? category.trim()
            : "",

        tags: Array.isArray(tags)
          ? tags
              .filter(
                (tag) =>
                  typeof tag === "string"
              )
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],

        seo: {
          title:
            seo &&
            typeof seo.title === "string"
              ? seo.title.trim()
              : "",

          description:
            seo &&
            typeof seo.description ===
              "string"
              ? seo.description.trim()
              : "",

          keywords:
            seo &&
            Array.isArray(seo.keywords)
              ? seo.keywords
                  .filter(
                    (keyword) =>
                      typeof keyword ===
                      "string"
                  )
                  .map((keyword) =>
                    keyword.trim()
                  )
                  .filter(Boolean)
              : [],
        },

        readTime: finalReadTime,

        status: finalStatus,

        publishedAt: finalPublishedAt,

        isFeatured: normalizeBoolean(
          isFeatured,
          false
        ),

        isActive: normalizeBoolean(
          isActive,
          true
        ),

        order: finalOrder,
      });

    return res.status(201).json({
      success: true,
      message:
        "Insight created successfully",
      insight,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - UPDATE INSIGHT
// ==========================================

const updateInsight = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid insight ID",
      });
    }

    const insight =
      await Insight.findById(id);

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: "Insight not found",
      });
    }

    const {
      title,
      slug,
      shortDescription,
      content,
      featuredImage,
      author,
      category,
      tags,
      seo,
      readTime,
      status,
      publishedAt,
      isFeatured,
      isActive,
      order,
    } = req.body;

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      insight.title = title.trim();
    }

    if (slug !== undefined) {
      if (
        typeof slug !== "string" ||
        !slug.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid slug",
        });
      }

      const finalSlug =
        generateSlug(slug);

      if (!finalSlug) {
        return res.status(400).json({
          success: false,
          message: "Invalid slug",
        });
      }

      const existingSlug =
        await Insight.findOne({
          slug: finalSlug,
          _id: { $ne: id },
        });

      if (existingSlug) {
        return res.status(409).json({
          success: false,
          message:
            "Another insight already uses this slug",
        });
      }

      insight.slug = finalSlug;
    }

    if (
      shortDescription !== undefined
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

      insight.shortDescription =
        shortDescription.trim();
    }

    if (content !== undefined) {
      if (
        typeof content !== "string" ||
        !content.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Content cannot be empty",
        });
      }

      insight.content = content.trim();
    }

    if (featuredImage !== undefined) {
      if (
        !featuredImage ||
        typeof featuredImage !==
          "object" ||
        Array.isArray(featuredImage) ||
        !featuredImage.url ||
        typeof featuredImage.url !==
          "string" ||
        !featuredImage.url.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid featured image URL is required",
        });
      }

      insight.featuredImage = {
        url: featuredImage.url.trim(),

        publicId:
          typeof featuredImage.publicId ===
          "string"
            ? featuredImage.publicId.trim()
            : "",

        altText:
          typeof featuredImage.altText ===
          "string"
            ? featuredImage.altText.trim()
            : "",
      };
    }

    if (author !== undefined) {
      if (
        author !== null &&
        (typeof author !== "object" ||
          Array.isArray(author))
      ) {
        return res.status(400).json({
          success: false,
          message: "Author must be an object",
        });
      }

      insight.author = {
        name:
          author &&
          typeof author.name === "string"
            ? author.name.trim()
            : "",

        designation:
          author &&
          typeof author.designation ===
            "string"
            ? author.designation.trim()
            : "",

        image: {
          url:
            author &&
            author.image &&
            typeof author.image.url ===
              "string"
              ? author.image.url.trim()
              : "",

          publicId:
            author &&
            author.image &&
            typeof author.image.publicId ===
              "string"
              ? author.image.publicId.trim()
              : "",
        },
      };
    }

    if (category !== undefined) {
      insight.category =
        typeof category === "string"
          ? category.trim()
          : "";
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message: "Tags must be an array",
        });
      }

      insight.tags = tags
        .filter(
          (tag) =>
            typeof tag === "string"
        )
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    if (seo !== undefined) {
      if (
        seo !== null &&
        (typeof seo !== "object" ||
          Array.isArray(seo))
      ) {
        return res.status(400).json({
          success: false,
          message: "SEO must be an object",
        });
      }

      insight.seo = {
        title:
          seo &&
          typeof seo.title === "string"
            ? seo.title.trim()
            : "",

        description:
          seo &&
          typeof seo.description ===
            "string"
            ? seo.description.trim()
            : "",

        keywords:
          seo &&
          Array.isArray(seo.keywords)
            ? seo.keywords
                .filter(
                  (keyword) =>
                    typeof keyword ===
                    "string"
                )
                .map((keyword) =>
                  keyword.trim()
                )
                .filter(Boolean)
            : [],
      };
    }

    if (readTime !== undefined) {
      const parsedReadTime =
        Number(readTime);

      if (
        !Number.isInteger(
          parsedReadTime
        ) ||
        parsedReadTime < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Read time must be a positive integer",
        });
      }

      insight.readTime =
        parsedReadTime;
    }

    if (status !== undefined) {
      if (
        !["draft", "published"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Status must be draft or published",
        });
      }

      insight.status = status;

      if (
        status === "published" &&
        !insight.publishedAt
      ) {
        insight.publishedAt =
          new Date();
      }

      if (status === "draft") {
        insight.publishedAt = null;
      }
    }

    if (publishedAt !== undefined) {
      insight.publishedAt =
        publishedAt || null;
    }

    if (isFeatured !== undefined) {
      insight.isFeatured =
        normalizeBoolean(
          isFeatured,
          insight.isFeatured
        );
    }

    if (isActive !== undefined) {
      insight.isActive =
        normalizeBoolean(
          isActive,
          insight.isActive
        );
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

      insight.order = parsedOrder;
    }

    await insight.save();

    return res.status(200).json({
      success: true,
      message:
        "Insight updated successfully",
      insight,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - DELETE INSIGHT
// ==========================================

const deleteInsight = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid insight ID",
      });
    }

    const insight =
      await Insight.findById(id);

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: "Insight not found",
      });
    }

    await Insight.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Insight deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - TOGGLE ACTIVE STATUS
// ==========================================

const toggleInsightStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid insight ID",
      });
    }

    const insight =
      await Insight.findById(id);

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: "Insight not found",
      });
    }

    insight.isActive =
      !insight.isActive;

    await insight.save();

    return res.status(200).json({
      success: true,
      message: `Insight ${
        insight.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      insight,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - PUBLISH / DRAFT
// ==========================================

const togglePublishStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid insight ID",
      });
    }

    const insight =
      await Insight.findById(id);

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: "Insight not found",
      });
    }

    if (insight.status === "published") {
      insight.status = "draft";
      insight.publishedAt = null;
    } else {
      insight.status = "published";

      if (!insight.publishedAt) {
        insight.publishedAt =
          new Date();
      }
    }

    await insight.save();

    return res.status(200).json({
      success: true,
      message: `Insight ${
        insight.status === "published"
          ? "published"
          : "moved to draft"
      } successfully`,
      insight,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getPublishedInsights,
  getPublishedInsightBySlug,
  getAllInsights,
  getInsightById,
  createInsight,
  updateInsight,
  deleteInsight,
  toggleInsightStatus,
  togglePublishStatus,
};