const User = require("../models/userModel");
const { generateToken } = require("../utils/jwt");
const { successResponse, errorResponse } = require("../utils/response");

// ─── POST /auth/register ──────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 409, "An account with this email already exists.");
    }

    // Create new user (password hashing is handled in the User model pre-save hook)
    const user = await User.create({ name, email, password, role });

    const token = generateToken(user._id);

    return successResponse(res, 201, "Account created successfully.", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return errorResponse(res, 500, "Something went wrong. Please try again.");
  }
};

// ─── POST /auth/login ─────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Explicitly include password since it has select: false in schema
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      // Use same message for both cases — avoids leaking which field is wrong
      return errorResponse(res, 401, "Invalid email or password.");
    }

    const token = generateToken(user._id);

    return successResponse(res, 200, "Logged in successfully.", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return errorResponse(res, 500, "Something went wrong. Please try again.");
  }
};

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  return successResponse(res, 200, "User profile fetched.", {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = { register, login, getMe };