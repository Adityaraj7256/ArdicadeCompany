const mongoose = require("mongoose");
const Settings = require("../models/Settings");

// ==========================================
// GET SETTINGS
// ==========================================

const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ isActive: true }).lean();

    // Agar settings document nahi hai to automatically create karo
    if (!settings) {
      settings = await Settings.create({});
      settings = settings.toObject();
    }

    return res.status(200).json({
      success: true,
      message: "Settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CREATE / INITIALIZE SETTINGS
// ==========================================

const createSettings = async (req, res, next) => {
  try {
    const existingSettings = await Settings.findOne();

    if (existingSettings) {
      return res.status(409).json({
        success: false,
        message: "Settings already exist.",
      });
    }

    const settings = await Settings.create(req.body || {});

    return res.status(201).json({
      success: true,
      message: "Settings created successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE SETTINGS
// ==========================================

const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(req.body || {});

      return res.status(201).json({
        success: true,
        message: "Settings created successfully",
        data: settings,
      });
    }

    // ==========================================
    // SAFE NESTED UPDATE
    // ==========================================

    const allowedSections = [
      "company",
      "contact",
      "address",
      "social",
      "website",
      "email",
      "notifications",
      "general",
    ];

    allowedSections.forEach((section) => {
      if (
        req.body[section] &&
        typeof req.body[section] === "object" &&
        !Array.isArray(req.body[section])
      ) {
        Object.keys(req.body[section]).forEach((key) => {
          settings[section][key] = req.body[section][key];
        });
      }
    });

    // ==========================================
    // ACTIVE STATUS
    // ==========================================

    if (typeof req.body.isActive === "boolean") {
      settings.isActive = req.body.isActive;
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE SINGLE SECTION
// ==========================================

const updateSettingsSection = async (req, res, next) => {
  try {
    const { section } = req.params;

    const allowedSections = [
      "company",
      "contact",
      "address",
      "social",
      "website",
      "email",
      "notifications",
      "general",
    ];

    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: "Invalid settings section.",
      });
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid section data.",
      });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    Object.keys(req.body).forEach((key) => {
      settings[section][key] = req.body[key];
    });

    await settings.save();

    return res.status(200).json({
      success: true,
      message: `${section} settings updated successfully`,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// RESET SETTINGS
// ==========================================

const resetSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();

    if (!settings) {
      const newSettings = await Settings.create({});

      return res.status(200).json({
        success: true,
        message: "Settings reset successfully",
        data: newSettings,
      });
    }

    // Default values ke saath naya document create
    await Settings.deleteOne({
      _id: settings._id,
    });

    const defaultSettings = await Settings.create({});

    return res.status(200).json({
      success: true,
      message: "Settings reset successfully",
      data: defaultSettings,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET SETTINGS BY ID
// ==========================================

const getSettingsById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid settings ID.",
      });
    }

    const settings = await Settings.findById(id);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE ACTIVE STATUS
// ==========================================

const updateSettingsStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean.",
      });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        isActive,
      });
    } else {
      settings.isActive = isActive;
      await settings.save();
    }

    return res.status(200).json({
      success: true,
      message: `Settings ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getSettings,
  createSettings,
  updateSettings,
  updateSettingsSection,
  resetSettings,
  getSettingsById,
  updateSettingsStatus,
};