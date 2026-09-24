const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ==========================================
// CONSTANTS
// ==========================================

const ALLOWED_ROLES = [
  "super_admin",
  "admin",
  "manager",
  "accountant",
  "it_staff",
  "construction_staff",
  "support_staff",
  "hr",
];

// ==========================================
// HELPERS
// ==========================================

const safeString = (value, fallback = "") => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value).trim();
};

const isValidObjectId = (id) => {
  return mongoose.isValidObjectId(id);
};

// ==========================================
// GET ALL USERS
// GET /api/users/admin/all
// PROTECTED - ADMIN
// ==========================================

const getAllUsers = async (req, res, next) => {
  try {
    const {
      search = "",
      role = "",
      status = "",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const query = {};

    // ----------------------------------------
    // SEARCH
    // ----------------------------------------

    const cleanSearch = safeString(search);

    if (cleanSearch) {
      query.$or = [
        {
          name: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
        {
          email: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
      ];
    }

    // ----------------------------------------
    // ROLE FILTER
    // ----------------------------------------

    if (role) {
      const cleanRole = safeString(role);

      if (!ALLOWED_ROLES.includes(cleanRole)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role",
        });
      }

      query.role = cleanRole;
    }

    // ----------------------------------------
    // STATUS FILTER
    // ----------------------------------------

    if (status) {
      const cleanStatus = safeString(status).toLowerCase();

      if (cleanStatus === "active") {
        query.isActive = true;
      } else if (cleanStatus === "inactive") {
        query.isActive = false;
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid user status",
        });
      }
    }

    // ----------------------------------------
    // TOTAL
    // ----------------------------------------

    const totalUsers = await User.countDocuments(query);

    const totalPages = Math.ceil(totalUsers / perPage);

    const skip = (currentPage - 1) * perPage;

    // ----------------------------------------
    // USERS
    // ----------------------------------------

    const users = await User.find(query)
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(perPage)
      .lean();

    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage,
        perPage,
        totalUsers,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);

    next(error);
  }
};

// ==========================================
// GET USER BY ID
// GET /api/users/admin/:id
// PROTECTED - ADMIN
// ==========================================

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET USER BY ID ERROR:", error);

    next(error);
  }
};

// ==========================================
// CREATE USER
// POST /api/users/admin
// PROTECTED - ADMIN
// ==========================================

const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = "admin",
      isActive = true,
    } = req.body;

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    const cleanName = safeString(name);
    const cleanEmail = safeString(email).toLowerCase();
    const cleanRole = safeString(role);

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (!ALLOWED_ROLES.includes(cleanRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    // ----------------------------------------
    // CHECK EXISTING USER
    // ----------------------------------------

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // ----------------------------------------
    // CREATE
    // ----------------------------------------
    // User model automatically hashes password
    // through pre-save middleware.
    // ----------------------------------------

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role: cleanRole,
      isActive: Boolean(isActive),
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    next(error);
  }
};

// ==========================================
// UPDATE USER
// PATCH /api/users/admin/:id
// PROTECTED - ADMIN
// ==========================================

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      name,
      email,
      password,
      isActive,
    } = req.body;

    // ----------------------------------------
    // NAME
    // ----------------------------------------

    if (name !== undefined) {
      const cleanName = safeString(name);

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      if (cleanName.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters",
        });
      }

      user.name = cleanName;
    }

    // ----------------------------------------
    // EMAIL
    // ----------------------------------------

    if (email !== undefined) {
      const cleanEmail = safeString(email).toLowerCase();

      if (!cleanEmail) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty",
        });
      }

      const existingUser = await User.findOne({
        email: cleanEmail,
        _id: {
          $ne: id,
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Another user already uses this email",
        });
      }

      user.email = cleanEmail;
    }

    // ----------------------------------------
    // PASSWORD
    // ----------------------------------------

    if (password !== undefined) {
      if (typeof password !== "string" || !password) {
        return res.status(400).json({
          success: false,
          message: "Password cannot be empty",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }

      user.password = password;
    }

    // ----------------------------------------
    // ACTIVE STATUS
    // ----------------------------------------

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false",
        });
      }

      // Prevent an admin from accidentally
      // disabling their own current account.
      if (
        String(user._id) === String(req.user.id) &&
        isActive === false
      ) {
        return res.status(400).json({
          success: false,
          message: "You cannot deactivate your own account",
        });
      }

      user.isActive = isActive;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    next(error);
  }
};

// ==========================================
// UPDATE USER ROLE
// PATCH /api/users/admin/:id/role
// PROTECTED - ADMIN
// ==========================================

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const cleanRole = safeString(role);

    if (!ALLOWED_ROLES.includes(cleanRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ----------------------------------------
    // PREVENT SELF ROLE CHANGE
    // ----------------------------------------

    if (String(user._id) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    user.role = cleanRole;

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("UPDATE USER ROLE ERROR:", error);

    next(error);
  }
};

// ==========================================
// UPDATE USER STATUS
// PATCH /api/users/admin/:id/status
// PROTECTED - ADMIN
// ==========================================

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ----------------------------------------
    // PREVENT SELF DEACTIVATION
    // ----------------------------------------

    if (
      String(user._id) === String(req.user.id) &&
      isActive === false
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    user.isActive = isActive;

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("UPDATE USER STATUS ERROR:", error);

    next(error);
  }
};

// ==========================================
// DELETE USER
// DELETE /api/users/admin/:id
// PROTECTED - ADMIN
// ==========================================

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // ----------------------------------------
    // PREVENT SELF DELETE
    // ----------------------------------------

    if (String(id) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    next(error);
  }
};

// ==========================================
// GET USER STATS
// GET /api/users/admin/stats
// PROTECTED - ADMIN
// ==========================================

const getUserStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      staffUsers,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        isActive: true,
      }),

      User.countDocuments({
        isActive: false,
      }),

      User.countDocuments({
        role: {
          $in: ["super_admin", "admin"],
        },
      }),

      User.countDocuments({
        role: {
          $nin: ["super_admin", "admin"],
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        staffUsers,
      },
    });
  } catch (error) {
    console.error("GET USER STATS ERROR:", error);

    next(error);
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserStats,
};