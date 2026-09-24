const Media = require("../models/Media");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");
const streamifier = require("streamifier");

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${process.env.CLOUDINARY_FOLDER || "ardicade"}/${folder}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const getCloudinaryFolder = (folder) => {
  const cleanFolder = String(folder || "general")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-");

  return cleanFolder || "general";
};

/*
|--------------------------------------------------------------------------
| Upload Media
|--------------------------------------------------------------------------
*/
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image file",
      });
    }

    const folder = getCloudinaryFolder(req.body.folder);

    const altText = String(req.body.altText || "").trim();
    const caption = String(req.body.caption || "").trim();

    const result = await uploadToCloudinary(
      req.file.buffer,
      folder
    );

    const media = await Media.create({
      originalName: req.file.originalname,
      fileName: result.original_filename || req.file.originalname,

      publicId: result.public_id,

      url: result.url,
      secureUrl: result.secure_url,

      resourceType: result.resource_type || "image",
      format: result.format || "",
      mimeType: req.file.mimetype,

      bytes: result.bytes || req.file.size || 0,

      width: result.width || null,
      height: result.height || null,

      folder,

      altText,
      caption,

      uploadedBy: req.user.id,

      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      media,
    });
  } catch (error) {
    console.error("UPLOAD MEDIA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload media",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get All Media
|--------------------------------------------------------------------------
*/
const getAllMedia = async (req, res) => {
  try {
    const {
      folder,
      search,
      active,
      page = 1,
      limit = 30,
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);

    const perPage = Math.min(
      Math.max(Number(limit) || 30, 1),
      100
    );

    const filter = {};

    if (folder) {
      filter.folder = folder;
    }

    if (active !== undefined) {
      filter.isActive = active === "true";
    }

    if (search) {
      filter.$or = [
        {
          originalName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          altText: {
            $regex: search,
            $options: "i",
          },
        },
        {
          caption: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (currentPage - 1) * perPage;

    const [media, total] = await Promise.all([
      Media.find(filter)
        .populate("uploadedBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage),

      Media.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return res.status(200).json({
      success: true,
      count: media.length,
      pagination: {
        total,
        page: currentPage,
        limit: perPage,
        totalPages,
      },
      media,
    });
  } catch (error) {
    console.error("GET MEDIA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch media",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Media
|--------------------------------------------------------------------------
*/
const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid media ID",
      });
    }

    const media = await Media.findById(id).populate(
      "uploadedBy",
      "name email role"
    );

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    return res.status(200).json({
      success: true,
      media,
    });
  } catch (error) {
    console.error("GET MEDIA BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch media",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Media Metadata
|--------------------------------------------------------------------------
*/
const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid media ID",
      });
    }

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    const {
      altText,
      caption,
      folder,
      isActive,
    } = req.body;

    if (altText !== undefined) {
      media.altText = String(altText).trim();
    }

    if (caption !== undefined) {
      media.caption = String(caption).trim();
    }

    if (folder !== undefined) {
      media.folder = getCloudinaryFolder(folder);
    }

    if (isActive !== undefined) {
      media.isActive =
        isActive === true ||
        isActive === "true";
    }

    await media.save();

    return res.status(200).json({
      success: true,
      message: "Media updated successfully",
      media,
    });
  } catch (error) {
    console.error("UPDATE MEDIA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update media",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete Media
|--------------------------------------------------------------------------
*/
const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid media ID",
      });
    }

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.resourceType || "image",
    });

    await Media.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("DELETE MEDIA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete media",
    });
  }
};

module.exports = {
  uploadMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
};