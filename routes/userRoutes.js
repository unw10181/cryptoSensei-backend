const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserAchievements,
  getUserStats,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// All user routes are protected
router.use(protect);

// GET /api/users/:id
router.get("/:id", getUserProfile);

// PUT /api/users/:id
router.put("/:id", updateUserProfile);

// GET /api/users/:id/achievements
router.get("/:id/achievements", getUserAchievements);

// GET /api/users/:id/stats
router.get("/:id/stats", getUserStats);

module.exports = router;
