const mongoose = require("mongoose");

const achievementSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  animeReference: {
    type: String, // e.g. "Solo Leveling", "Dragon Ball Z"
    default: "Solo Leveling",
  },
  imageUrl: {
    type: String,
    default: "",
  },
  // Internal key used to check if user has unlocked this
  requirementKey: {
    type: String,
    required: true,
    unique: true,
  },
  // What value triggers this achievement
  requirementValue: {
    type: Number,
    default: 1,
  },
  tier: {
    type: String,
    enum: ["bronze", "silver", "gold", "legendary"],
    default: "bronze",
  },
  xpReward: {
    type: Number,
    default: 100,
  },
});

module.exports = mongoose.model("Achievement", achievementSchema);
