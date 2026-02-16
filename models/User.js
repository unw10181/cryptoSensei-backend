const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      minlength: [4, "Username must be atleast 4 characters"],
      maxlength: [15, "Username must not exceed 15 characters"],
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never return password in queries
    },
    virtualBalance: {
      type: Number,
      default: 100000, // Start with $100,000 virtual dollars
    },
    avatar: {
      type: String,
      default: "default_avatar",
    },
  },
  {
    timestamps: true,
  },
);
// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password to hashed passwords
userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

//Method to update rank based on HP
userSchema.methods.updateRank = function () {
  const xp = this.totalXP;
  if (xp >= 50000) this.rank = "Monarch";
  else if (xp >= 20000) this.rank = "National-Level";
  else if (xp >= 10000) this.rank = "S-Rank";
  else if (xp >= 5000) this.rank = "A-Rank";
  else if (xp >= 2000) this.rank = "B-Rank";
  else if (xp >= 500) this.rank = "C-Rank";
  else if (xp >= 100) this.rank = "D-Rank";
  else this.rank = "E-Rank";
};

module.exports = mongoose.model("User", userSchema);
