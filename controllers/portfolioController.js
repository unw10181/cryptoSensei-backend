const Portfolio = require("../models/Portfolio");
const Transaction = require("../models/Transaction");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");

//   Get all portfolios for logged-in user
//   GET /api/portfolios
// All Private methods
const getPortfolios = asyncHandler(async (req, res) => {
  const portfolios = await Portfolio.find({
    userId: req.user._id,
    isActive: true,
  });

  res.status(200).json({
    success: true,
    count: portfolios.length,
    data: portfolios,
  });
});

//       Create new portfolio
// api:   POST /api/portfolios
const createPortfolio = asyncHandler(async (req, res, next) => {
  const { name, description, startingCash } = req.body;

  if (!name) {
    return next(new AppError("Portfolio name is required", 400));
  }

  // Cap starting cash between 1000 and 100000
  const cashAmount = Math.min(Math.max(startingCash || 10000, 1000), 100000);

  const portfolio = await Portfolio.create({
    userId: req.user._id,
    name,
    description: description || "",
    cashBalance: cashAmount,
  });

  res.status(201).json({ success: true, data: portfolio });
});

//   Get single portfolio by ID
// route:   GET /api/portfolios/:id
const getPortfolio = asyncHandler(async (req, res, next) => {
  const portfolio = await Portfolio.findById(req.params.id);

  if (!portfolio) {
    return next(new AppError("Portfolio not found", 404));
  }

  // Ensure portfolio belongs to requesting user
  if (portfolio.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to access this portfolio", 403));
  }

  res.status(200).json({ success: true, data: portfolio });
});

//   Update portfolio (name or description only)
//   PUT /api/portfolios/:id
const updatePortfolio = asyncHandler(async (req, res, next) => {
  let portfolio = await Portfolio.findById(req.params.id);

  if (!portfolio) {
    return next(new AppError("Portfolio not found", 404));
  }

  if (portfolio.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to update this portfolio", 403));
  }

  const { name, description } = req.body;
  const updateFields = {};
  if (name) updateFields.name = name;
  if (description !== undefined) updateFields.description = description;

  portfolio = await Portfolio.findByIdAndUpdate(
    req.params.id,
    { $set: updateFields },
    { new: true, runValidators: true },
  );

  res.status(200).json({ success: true, data: portfolio });
});

//    Delete portfolio (soft delete)
//    DELETE /api/portfolios/:id
//   Private
const deletePortfolio = asyncHandler(async (req, res, next) => {
  const portfolio = await Portfolio.findById(req.params.id);

  if (!portfolio) {
    return next(new AppError("Portfolio not found", 404));
  }

  if (portfolio.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to delete this portfolio", 403));
  }

  // Soft delete
  await Portfolio.findByIdAndUpdate(req.params.id, { isActive: false });

  res
    .status(200)
    .json({ success: true, message: "Portfolio deleted successfully" });
});

//    Get portfolio performance metrics
//    GET /api/portfolios/:id/performance
//    Private API
const getPortfolioPerformance = asyncHandler(async (req, res, next) => {
  const portfolio = await Portfolio.findById(req.params.id);

  if (!portfolio) {
    return next(new AppError("Portfolio not found", 404));
  }

  if (portfolio.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  // Get all transactions for this portfolio
  const transactions = await Transaction.find({
    portfolioId: req.params.id,
  }).sort({ createdAt: 1 });

  const totalBought = transactions
    .filter((t) => t.type === "buy")
    .reduce((acc, t) => acc + t.totalValue, 0);

  const totalSold = transactions
    .filter((t) => t.type === "sell")
    .reduce((acc, t) => acc + t.totalValue, 0);

  const totalTrades = transactions.length;
  const buyTrades = transactions.filter((t) => t.type === "buy").length;
  const sellTrades = transactions.filter((t) => t.type === "sell").length;

  res.status(200).json({
    success: true,
    data: {
      portfolioId: portfolio._id,
      portfolioName: portfolio.name,
      cashBalance: portfolio.cashBalance,
      holdings: portfolio.holdings,
      totalInvested: portfolio.totalInvested,
      totalBought,
      totalSold,
      totalTrades,
      buyTrades,
      sellTrades,
      recentTransactions: transactions.slice(-5),
    },
  });
});

module.exports = {
  getPortfolios,
  createPortfolio,
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioPerformance,
};
