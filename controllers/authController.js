const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");

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

// ==========================================
// REGISTER
// POST /api/auth/register
// PUBLIC
// ==========================================

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    const cleanName = safeString(name);
    const cleanEmail = safeString(email).toLowerCase();

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
    // CREATE USER
    // ----------------------------------------
    // IMPORTANT:
    // Do NOT allow public registration to choose
    // super_admin/admin/etc. role.
    //
    // User model default role = admin, so we
    // explicitly set it here.
    // ----------------------------------------

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role: "admin",
      isActive: true,
    });

    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    // Duplicate email protection
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
// LOGIN
// POST /api/auth/login
// PUBLIC
// ==========================================

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    const cleanEmail = safeString(email).toLowerCase();

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

    // ----------------------------------------
    // FIND USER
    // ----------------------------------------
    // password has select:false in User model,
    // therefore explicitly select it for login.
    // ----------------------------------------

    const user = await User.findOne({
      email: cleanEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ----------------------------------------
    // CHECK ACTIVE STATUS
    // ----------------------------------------

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // ----------------------------------------
    // CHECK PASSWORD
    // ----------------------------------------

    const isPasswordCorrect =
      await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ----------------------------------------
    // UPDATE LAST LOGIN
    // ----------------------------------------

    user.lastLogin = new Date();

    await user.save({
      validateBeforeSave: false,
    });

    // ----------------------------------------
    // GENERATE JWT
    // ----------------------------------------

    const token = generateToken(user);

    // ----------------------------------------
    // SET HTTP-ONLY COOKIE
    // ----------------------------------------

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    next(error);
  }
};

// ==========================================
// LOGOUT
// POST /api/auth/logout
// PUBLIC
// ==========================================

const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    next(error);
  }
};

// ==========================================
// GET CURRENT USER
// GET /api/auth/me
// PROTECTED
// ==========================================

const getMe = async (req, res, next) => {
  try {
    // protect middleware puts decoded JWT
    // information inside req.user

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    return res.status(200).json({
      success: true,
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
    console.error("GET ME ERROR:", error);

    next(error);
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  register,
  login,
  logout,
  getMe,
};