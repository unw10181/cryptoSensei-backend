const Transaction = require("../models/Transaction");
const Portfolio = require("../models/Portfolio");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");
const { checkAchievements } = require("../utils/achievementChecker");

// Get all transactions method for portfolios
// api: GET /api/transactions/portfolio/:portfolioId
const getTransactions = asyncHandler(async (req, res, next) => {
  const portfolio = await Portfolio.findById(req.params.portfolioId);

  if (!portfolio) {
    return next(new AppError("Portfolio not found", 404));
  }

  if (portfolio.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  const transactions = await Transaction.find({
    portfolioId: req.params.portfolioId,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions,
  });
});
