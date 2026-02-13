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
    return next(new AppError('Not authorized to update this profile', 403));
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
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({ success: true, data: updatedUser });
});



