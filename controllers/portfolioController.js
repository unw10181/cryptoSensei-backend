const Portfolio = require("../models/Portfolio");
const Transaction = require("../models/Transaction");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");

// ─── @desc    Get all portfolios for logged-in user
// ─── @route   GET /api/portfolios
// ─── @access  Private
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


// ─── @desc    Create new portfolio
// ─── @route   POST /api/portfolios
// ─── @access  Private
const createPortfolio = asyncHandler(async (req, res, next) => {
  const { name, description, startingCash } = req.body;

  if (!name) {
    return next(new AppError('Portfolio name is required', 400));
  }

  // Cap starting cash between 1000 and 100000
  const cashAmount = Math.min(Math.max(startingCash || 10000, 1000), 100000);

  const portfolio = await Portfolio.create({
    userId: req.user._id,
    name,
    description: description || '',
    cashBalance: cashAmount,
  });

  res.status(201).json({ success: true, data: portfolio });
});
