const Achievement = require("../models/Achievement");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Portfolio = require("../models/Portfolio");
const UserAchievement = require("../models/userAchievement");

// Check and unlock achievements after transactions

const checkAchievements = async (userId) => {
  try {
    const allAchievements = await Achievement.find();
    const userAchievements = await UserAchievement.find({ userId }).select(
      "achievementId",
    );
    const unlockedIds = userAchievements.map((ua) =>
      ua.achievementId.toString(),
    );

    const user = await User.findById(userId);
    const transactions = await Transaction.find({ userId });
    const portfolios = await Portfolio.find({ userId });

    const newlyUnlocked = [];

    for (const achievement of allAchievements) {
      // Skip already unlocked
      if (unlockedIds.includes(achievement._id.toString())) continue;

      let shouldUnlock = false;

      switch (achievement.requirementKey) {
        // Transaction-based 
        case "first_trade":
          shouldUnlock = transactions.length >= 1;
          break;

        case "ten_trades":
          shouldUnlock = transactions.length >= 10;
          break;

        case "fifty_trades":
          shouldUnlock = transactions.length >= 50;
          break;

        case "first_buy":
          shouldUnlock = transactions.some((t) => t.type === "buy");
          break;

        case "first_sell":
          shouldUnlock = transactions.some((t) => t.type === "sell");
          break;

        case "big_spender":
          // Single transaction over $5,000
          shouldUnlock = transactions.some((t) => t.totalValue >= 5000);
          break;

        case "whale_trade":
          // Single transaction over $50,000
          shouldUnlock = transactions.some((t) => t.totalValue >= 50000);
          break;

        // ── Portfolio-based 
        case "first_portfolio":
          shouldUnlock = portfolios.length >= 1;
          break;

        case "three_portfolios":
          shouldUnlock = portfolios.length >= 3;
          break;

        case "diversified":
          // Has at least 5 different cryptos across portfolios
          const allSymbols = portfolios.flatMap((p) =>
            p.holdings.map((h) => h.cryptoSymbol),
          );
          shouldUnlock = new Set(allSymbols).size >= 5;
          break;

        // Rank / XP-based 
        case "reach_d_rank":
          shouldUnlock = user.totalXP >= 100;
          break;

        case "reach_s_rank":
          shouldUnlock = user.totalXP >= 10000;
          break;

        case "reach_monarch":
          shouldUnlock = user.totalXP >= 50000;
          break;

        default:
          break;
      }

      if (shouldUnlock) {
        // Unlock achievement
        await UserAchievement.create({
          userId,
          achievementId: achievement._id,
        });

        // Award XP to user
        await User.findByIdAndUpdate(userId, {
          $inc: { totalXP: achievement.xpReward },
        });

        // Update rank
        const updatedUser = await User.findById(userId);
        updatedUser.updateRank();
        await updatedUser.save();

        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error("Achievement check error:", error.message);
    return [];
  }
};

module.exports = { checkAchievements };