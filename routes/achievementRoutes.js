const express = require("express");
const router = express.Router();
const {
  getAllAchievements,
  getAchievement,
  triggerAchievementCheck,
  getUserAchievementProgress,
} = require("../controllers/achievementController");
const { protect } = require("../middleware/authMiddleware");

// All achievement routes are protected
router.use(protect);

// GET  /api/achievements                → get all achievements
router.get("/", getAllAchievements);

// GET  /api/achievements/user-progress  → all achievements + user's unlock status
router.get("/user-progress", getUserAchievementProgress);

// POST /api/achievements/check          → trigger achievement check for user
router.post("/check", triggerAchievementCheck);

// GET  /api/achievements/:id            → single achievement
router.get("/:id", getAchievement);

module.exports = router;
