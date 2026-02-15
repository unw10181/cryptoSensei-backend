const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const Achievement = require("../models/Achievement");

const achievements = [
  // ── BRONZE TIER ────────────────────────────────────────────────────────────
  {
    name: "Arise",
    description:
      "Complete your first trade. The System has acknowledged your existence.",
    animeCharacter: "Sung Jin-Woo (E-Rank)",
    animeReference: "Solo Leveling",
    requirementKey: "first_trade",
    requirementValue: 1,
    tier: "bronze",
    xpReward: 50,
  },
  {
    name: "First Buy Order",
    description: "Execute your first BUY transaction.",
    animeCharacter: "Sung Jin-Woo",
    animeReference: "Solo Leveling",
    requirementKey: "first_buy",
    requirementValue: 1,
    tier: "bronze",
    xpReward: 25,
  },
  {
    name: "First Sell Order",
    description:
      "Execute your first SELL transaction. Know when to take profits.",
    animeCharacter: "Sung Jin-Woo",
    animeReference: "Solo Leveling",
    requirementKey: "first_sell",
    requirementValue: 1,
    tier: "bronze",
    xpReward: 25,
  },
  {
    name: "Shadow Soldier",
    description: "Create your first portfolio.",
    animeCharacter: "Igris",
    animeReference: "Solo Leveling",
    requirementKey: "first_portfolio",
    requirementValue: 1,
    tier: "bronze",
    xpReward: 50,
  },
  {
    name: "D-Rank Hunter",
    description: "Earn 100 XP. You have proven you are more than an E-Rank.",
    animeCharacter: "Sung Jin-Woo (D-Rank)",
    animeReference: "Solo Leveling",
    requirementKey: "reach_d_rank",
    requirementValue: 100,
    tier: "bronze",
    xpReward: 75,
  },

  // ── SILVER TIER ────────────────────────────────────────────────────────────
  {
    name: "Shadow Army",
    description: "Complete 10 trades. Your shadow army grows.",
    animeCharacter: "Beru",
    animeReference: "Solo Leveling",
    requirementKey: "ten_trades",
    requirementValue: 10,
    tier: "silver",
    xpReward: 200,
  },
  {
    name: "Multi-Dungeon Hunter",
    description: "Create 3 separate portfolios.",
    animeCharacter: "Go Gunhee",
    animeReference: "Solo Leveling",
    requirementKey: "three_portfolios",
    requirementValue: 3,
    tier: "silver",
    xpReward: 150,
  },
  {
    name: "Diversified Dungeon Clearer",
    description: "Hold 5 different cryptocurrencies across your portfolios.",
    animeCharacter: "Sung Jin-Woo (S-Rank)",
    animeReference: "Solo Leveling",
    requirementKey: "diversified",
    requirementValue: 5,
    tier: "silver",
    xpReward: 200,
  },
  {
    name: "Big Spender",
    description: "Execute a single trade worth over $5,000.",
    animeCharacter: "Thomas Andre",
    animeReference: "Solo Leveling",
    requirementKey: "big_spender",
    requirementValue: 5000,
    tier: "silver",
    xpReward: 250,
  },

  // ── GOLD TIER ──────────────────────────────────────────────────────────────
  {
    name: "S-Rank Hunter",
    description: "Earn 10,000 XP. You stand at the top of all hunters.",
    animeCharacter: "Sung Jin-Woo (National-Level)",
    animeReference: "Solo Leveling",
    requirementKey: "reach_s_rank",
    requirementValue: 10000,
    tier: "gold",
    xpReward: 1000,
  },
  {
    name: "The Strongest Hunter",
    description:
      "Complete 50 trades. You have cleared dungeons no one else dared enter.",
    animeCharacter: "Sung Jin-Woo (Shadow Monarch)",
    animeReference: "Solo Leveling",
    requirementKey: "fifty_trades",
    requirementValue: 50,
    tier: "gold",
    xpReward: 500,
  },
  {
    name: "Whale of the Abyss",
    description: "Execute a single trade worth over $50,000.",
    animeCharacter: "Antares (Dragon King)",
    animeReference: "Solo Leveling",
    requirementKey: "whale_trade",
    requirementValue: 50000,
    tier: "gold",
    xpReward: 750,
  },

  // ── LEGENDARY TIER ─────────────────────────────────────────────────────────
  {
    name: "Shadow Monarch",
    description:
      "Earn 50,000 XP. You are no longer human. You are the Monarch of Shadows.",
    animeCharacter: "Sung Jin-Woo (Shadow Monarch)",
    animeReference: "Solo Leveling",
    requirementKey: "reach_monarch",
    requirementValue: 50000,
    tier: "legendary",
    xpReward: 5000,
  },
];

const seedAchievements = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for seeding...");

    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log("Cleared existing achievements");

    // Insert new achievements
    await Achievement.insertMany(achievements);
    console.log(`🏆 Seeded ${achievements.length} achievements successfully!`);

    console.log("\nAchievement Tiers:");
    console.log(
      `  Bronze:    ${achievements.filter((a) => a.tier === "bronze").length}`,
    );
    console.log(
      `  Silver:    ${achievements.filter((a) => a.tier === "silver").length}`,
    );
    console.log(
      `  Gold:      ${achievements.filter((a) => a.tier === "gold").length}`,
    );
    console.log(
      `  Legendary: ${achievements.filter((a) => a.tier === "legendary").length}`,
    );

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedAchievements();
