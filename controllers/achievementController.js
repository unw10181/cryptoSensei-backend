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