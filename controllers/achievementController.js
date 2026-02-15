const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/userAchievement");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");
const { checkAchievements } = require("../utils/achievementChecker");


// Get all available achievements
// GET /api/achievements

const getAllAchievements = asyncHandler(async (req, res) => {
  const achievements = await Achievement.find().sort({ tier: 1, xpReward: 1 });

  res.status(200).json({
    success: true,
    count: achievements.length,
    data: achievements,
  });
});

// Get single achievement by ID
// GET /api/achievements/:id
const getAchievement = asyncHandler(async (req, res, next) => {
  const achievement = await Achievement.findById(req.params.id);

  if (!achievement) {
    return next(new AppError('Achievement not found', 404));
  }

  res.status(200).json({ success: true, data: achievement });
});

// Manually trigger achievement check for logged-in user
// POST /api/achievements/check
const triggerAchievementCheck = asyncHandler(async (req, res) => {
  const newlyUnlocked = await checkAchievements(req.user._id);

  res.status(200).json({
    success: true,
    newlyUnlocked: newlyUnlocked.length,
    data: newlyUnlocked,
  });
});

//Get all achievements with user's unlock status
// Route: GET /api/achievements/user-progress
const getUserAchievementProgress = asyncHandler(async (req, res) => {
  const allAchievements = await Achievement.find().sort({ xpReward: 1 });
  const userUnlocked = await UserAchievement.find({
    userId: req.user._id,
  }).select("achievementId unlockedAt");

  const unlockedMap = {};
  userUnlocked.forEach((ua) => {
    unlockedMap[ua.achievementId.toString()] = ua.unlockedAt;
  });

  const progressData = allAchievements.map((a) => ({
    ...a.toObject(),
    isUnlocked: !!unlockedMap[a._id.toString()],
    unlockedAt: unlockedMap[a._id.toString()] || null,
  }));

  res.status(200).json({
    success: true,
    totalAchievements: allAchievements.length,
    unlockedCount: userUnlocked.length,
    data: progressData,
  });
});

module.exports = {
  getAllAchievements,
  getAchievement,
  triggerAchievementCheck,
  getUserAchievementProgress,
};

