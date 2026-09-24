const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ==========================================
// USER SCHEMA
// ==========================================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        "manager",
        "accountant",
        "it_staff",
        "construction_staff",
        "support_staff",
        "hr",
      ],
      default: "admin",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// PASSWORD HASHING
// ==========================================

userSchema.pre("save", async function () {
  // Password already hashed hai to dobara hash mat karo
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

// ==========================================
// COMPARE PASSWORD
// ==========================================

userSchema.methods.comparePassword = async function (
  enteredPassword
) {
  if (!enteredPassword || !this.password) {
    return false;
  }

  return bcrypt.compare(
    enteredPassword,
    this.password
  );
};

// ==========================================
// MODEL
// ==========================================

// Prevent Mongoose OverwriteModelError
const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

module.exports = User;