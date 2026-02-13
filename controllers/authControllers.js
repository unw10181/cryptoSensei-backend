const User = require("../models/User");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");
const { sendTokenResponse } = require("../utils/generateToken");

// ─── @desc    Register new user
// ─── @route   POST /api/auth/register
// ─── @access  Public

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

  
};);
