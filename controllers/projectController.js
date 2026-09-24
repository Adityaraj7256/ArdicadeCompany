const Project = require("../models/Project");

const safeString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const normalizeSlug = (value) => {
  return safeString(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => safeString(item))
    .filter(Boolean);
};

const normalizeImage = (image) => {
  if (!image) {
    return null;
  }

  return {
    url: safeString(image.url),
    publicId: safeString(image.publicId),
    altText: safeString(image.altText),
  };
};

const normalizeGallery = (gallery) => {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery
    .map(normalizeImage)
    .filter((image) => image?.url);
};

/*
|--------------------------------------------------------------------------
| FIX: Boolean Normalization
|--------------------------------------------------------------------------
| Boolean("false") returns true in JavaScript.
| This caused isActive/isFeatured to become true when frontend sent
| "false" as a string.
*/
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

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

const getActiveProjects = async (req, res, next) => {
  try {
    const {
      category,
      status,
      featured,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (featured !== undefined) {
      filter.isFeatured = featured === "true";
    }

    const projects = await Project.find(filter)
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      isActive: true,
      isFeatured: true,
    })
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

const getProjectBySlug = async (req, res, next) => {
  try {
    const slug = normalizeSlug(req.params.slug);

    const project = await Project.findOne({
      slug,
      isActive: true,
    }).lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

const getAllProjects = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      active,
      featured,
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);

    const perPage = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (active !== undefined) {
      filter.isActive = active === "true";
    }

    if (featured !== undefined) {
      filter.isFeatured = featured === "true";
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          shortDescription: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          clientName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          location: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (currentPage - 1) * perPage;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({
          order: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Project.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return res.status(200).json({
      success: true,
      count: projects.length,
      pagination: {
        total,
        page: currentPage,
        limit: perPage,
        totalPages,
      },
      projects,
    });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(
      req.params.id
    ).lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      description,
      category,
      status,
      clientName,
      location,
      startDate,
      endDate,
      technologies,
      features,
      thumbnail,
      gallery,
      websiteUrl,
      isFeatured,
      order,
      isActive,
    } = req.body;

    if (!safeString(title)) {
      return res.status(400).json({
        success: false,
        message: "Project title is required",
      });
    }

    const projectSlug =
      normalizeSlug(slug || title);

    if (!projectSlug) {
      return res.status(400).json({
        success: false,
        message: "Valid project slug is required",
      });
    }

    const existingProject = await Project.findOne({
      slug: projectSlug,
    });

    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: "Project with this slug already exists",
      });
    }

    const project = await Project.create({
      title: safeString(title),

      slug: projectSlug,

      shortDescription:
        safeString(shortDescription),

      description:
        safeString(description),

      category:
        safeString(category),

      status:
        safeString(status),

      clientName:
        safeString(clientName),

      location:
        safeString(location),

      startDate:
        startDate || null,

      endDate:
        endDate || null,

      technologies:
        normalizeStringArray(technologies),

      features:
        normalizeStringArray(features),

      thumbnail:
        normalizeImage(thumbnail),

      gallery:
        normalizeGallery(gallery),

      websiteUrl:
        safeString(websiteUrl),

      /*
      |--------------------------------------------------------------------------
      | FIXED
      |--------------------------------------------------------------------------
      */
      isFeatured:
        normalizeBoolean(isFeatured, false),

      order:
        Number(order || 0),

      /*
      |--------------------------------------------------------------------------
      | FIXED
      |--------------------------------------------------------------------------
      */
      isActive:
        normalizeBoolean(isActive, true),
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const body = req.body;

    if (body.title !== undefined) {
      project.title =
        safeString(body.title);
    }

    if (body.slug !== undefined) {
      const newSlug =
        normalizeSlug(body.slug);

      if (!newSlug) {
        return res.status(400).json({
          success: false,
          message: "Valid project slug is required",
        });
      }

      const existingProject =
        await Project.findOne({
          slug: newSlug,
          _id: {
            $ne: project._id,
          },
        });

      if (existingProject) {
        return res.status(409).json({
          success: false,
          message:
            "Project with this slug already exists",
        });
      }

      project.slug = newSlug;
    }

    if (body.shortDescription !== undefined) {
      project.shortDescription =
        safeString(body.shortDescription);
    }

    if (body.description !== undefined) {
      project.description =
        safeString(body.description);
    }

    if (body.category !== undefined) {
      project.category =
        safeString(body.category);
    }

    if (body.status !== undefined) {
      project.status =
        safeString(body.status);
    }

    if (body.clientName !== undefined) {
      project.clientName =
        safeString(body.clientName);
    }

    if (body.location !== undefined) {
      project.location =
        safeString(body.location);
    }

    if (body.startDate !== undefined) {
      project.startDate =
        body.startDate || null;
    }

    if (body.endDate !== undefined) {
      project.endDate =
        body.endDate || null;
    }

    if (body.technologies !== undefined) {
      project.technologies =
        normalizeStringArray(
          body.technologies
        );
    }

    if (body.features !== undefined) {
      project.features =
        normalizeStringArray(
          body.features
        );
    }

    if (body.thumbnail !== undefined) {
      project.thumbnail =
        normalizeImage(body.thumbnail);
    }

    if (body.gallery !== undefined) {
      project.gallery =
        normalizeGallery(body.gallery);
    }

    if (body.websiteUrl !== undefined) {
      project.websiteUrl =
        safeString(body.websiteUrl);
    }

    /*
    |--------------------------------------------------------------------------
    | FIXED
    |--------------------------------------------------------------------------
    */
    if (body.isFeatured !== undefined) {
      project.isFeatured =
        normalizeBoolean(
          body.isFeatured,
          project.isFeatured
        );
    }

    if (body.order !== undefined) {
      project.order =
        Number(body.order || 0);
    }

    /*
    |--------------------------------------------------------------------------
    | FIXED
    |--------------------------------------------------------------------------
    */
    if (body.isActive !== undefined) {
      project.isActive =
        normalizeBoolean(
          body.isActive,
          project.isActive
        );
    }

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

const toggleProjectStatus = async (
  req,
  res,
  next
) => {
  try {
    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.isActive = !project.isActive;

    await project.save();

    return res.status(200).json({
      success: true,
      message: project.isActive
        ? "Project activated successfully"
        : "Project deactivated successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

const toggleProjectFeatured = async (
  req,
  res,
  next
) => {
  try {
    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.isFeatured =
      !project.isFeatured;

    await project.save();

    return res.status(200).json({
      success: true,
      message: project.isFeatured
        ? "Project marked as featured"
        : "Project removed from featured",
      project,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (
  req,
  res,
  next
) => {
  try {
    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await Project.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveProjects,
  getFeaturedProjects,
  getProjectBySlug,

  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  toggleProjectStatus,
  toggleProjectFeatured,
  deleteProject,
};