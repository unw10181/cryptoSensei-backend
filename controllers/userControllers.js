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

// ─── @desc    Update user profile
// ─── @route   PUT /api/users/:id
// ─── @access  Private
const updateUserProfile = asyncHandler(async (req, res, next) => {
  // Ensure user can only update their own profile
  if (req.params.id !== req.user._id.toString()) {
    return next(new AppError("Not authorized to update this profile", 403));
  }

  const { username, email, avatar } = req.body;

  // Build update object with only allowed fields
  const updateFields = {};
  if (username) updateFields.username = username;
  if (email) updateFields.email = email;
  if (avatar) updateFields.avatar = avatar;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updateFields },
    { new: true, runValidators: true },
  );

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({ success: true, data: updatedUser });
});

// ─── @desc    Get user's unlocked achievements
// ─── @route   GET /api/users/:id/achievements
// ─── @access  Private
const getUserAchievements = asyncHandler(async (req, res, next) => {
  const userAchievements = await UserAchievement.find({
    userId: req.params.id,
  }).populate("achievementId");

  res.status(200).json({
    success: true,
    count: userAchievements.length,
    data: userAchievements,
  });
});

// ─── @desc    Get user stats summary
// ─── @route   GET /api/users/:id/stats
// ─── @access  Private
const getUserStats = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const achievementsCount = await UserAchievement.countDocuments({
    userId: req.params.id,
  });

  res.status(200).json({
    success: true,
    data: {
      username: user.username,
      rank: user.rank,
      totalXP: user.totalXP,
      virtualBalance: user.virtualBalance,
      achievementsUnlocked: achievementsCount,
    },
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserAchievements,
  getUserStats,
};
