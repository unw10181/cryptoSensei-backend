const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Send as token
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      virtualBalance: user.virtualBalance,
      rank: user.rank,
      totalXP: user.totalXP,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
};

module.exports = { generateToken, sendTokenResponse };