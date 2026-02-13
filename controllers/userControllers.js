const User = require("../models/User");
const UserAchievement = require("../models/userAchievement");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");

// ─── @desc    Get user profile by ID
// ─── @route   GET /api/users/:id
// ─── @access  Private
const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({ success: true, data: user });
});


