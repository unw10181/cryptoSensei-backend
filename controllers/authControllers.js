const User = require("../models/User");
const { asyncHandler, AppError } = require("../middleware/errMiddleware");
const { sendTokenResponse } = require("../utils/generateToken");

// Register new user
// POST /api/auth/register

const register = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  // Validate fields
  if (!username || !email || !password) {
    return next(
      new AppError("Please provide username, email and password", 400),
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return next(new AppError("Username or email already in use", 400));
  }

  // Create user
  const user = await User.create({ username, email, password });

  sendTokenResponse(user, 201, res);
});

// Login user
// POST /api/auth/login
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  sendTokenResponse(user, 200, res);
});

// Logout user (client-side token removal, server confirms)
// API: POST /api/auth/logout
// Private API
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully. Please remove token on client.",
  });
});

// Get currently logged-in user
// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, data: user });
});

module.exports = { register, login, logout, getMe };
