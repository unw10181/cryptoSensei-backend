const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
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
  },
  virtualBalance: {
    type: Number,
    default: 100000, // Start with $100,000 virtual dollars
  },
  avatar: {
    type: String,
    default: "default_avatar",
  },
});

userSchema.pre("save", async () => {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isCorrectPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = model("User", userSchema);
