const Transaction = require("../models/Transaction");
const Portfolio = require("../models/Portfolio");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");
const { checkAchievements } = require("../utils/achievementChecker");

// All api's private
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

// Buy or Sell Transaction methods
// API: POST /api/transactions
const createTransaction = asyncHandler(async (req, res, next) => {
  const {
    portfolioId,
    type,
    cryptoSymbol,
    cryptoName,
    cryptoImageUrl,
    quantity,
    pricePerCoin,
    notes,
  } = req.body;

  // Validate required fields
  if (
    !portfolioId ||
    !type ||
    !cryptoSymbol ||
    !cryptoName ||
    !quantity ||
    !pricePerCoin
  ) {
    return next(
      new AppError("Please provide all required transaction fields", 400),
    );
  }

  if (!["buy", "sell"].includes(type)) {
    return next(new AppError("Transaction type must be buy or sell", 400));
  }

  if (quantity <= 0 || pricePerCoin <= 0) {
    return next(new AppError("Quantity and price must be greater than 0", 400));
  }

  // Find portfolio and verify ownership
  const portfolio = await Portfolio.findById(portfolioId);
  if (!portfolio) {
    return next(new AppError("Portfolio not found", 404));
  }

  if (portfolio.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  const totalValue = quantity * pricePerCoin;
  const symbolUpper = cryptoSymbol.toUpperCase();

  // BUY Logic 
  if (type === "buy") {
    if (portfolio.cashBalance < totalValue) {
      return next(
        new AppError(
          `Insufficient funds. Available: $${portfolio.cashBalance.toFixed(2)}, Required: $${totalValue.toFixed(2)}`,
          400,
        ),
      );
    }

    // Deduct cash from portfolio
    portfolio.cashBalance -= totalValue;
    portfolio.totalInvested += totalValue;

    // Update holdings
    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.cryptoSymbol === symbolUpper,
    );

    if (holdingIndex >= 0) {
      // Already holding this crypto → update avg buy price
      const existing = portfolio.holdings[holdingIndex];
      const existingCost = existing.quantity * existing.avgBuyPrice;
      const newCost = quantity * pricePerCoin;
      const newQuantity = existing.quantity + quantity;

      portfolio.holdings[holdingIndex].quantity = newQuantity;
      portfolio.holdings[holdingIndex].avgBuyPrice =
        (existingCost + newCost) / newQuantity;
    } else {
      // New crypto holding
      portfolio.holdings.push({
        cryptoSymbol: symbolUpper,
        cryptoName,
        quantity,
        avgBuyPrice: pricePerCoin,
        imageUrl: cryptoImageUrl || "",
      });
    }
  }

  //  SELL Logic 
  if (type === "sell") {
    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.cryptoSymbol === symbolUpper,
    );

    if (holdingIndex < 0) {
      return next(new AppError(`You don't own any ${cryptoSymbol}`, 400));
    }

    const holding = portfolio.holdings[holdingIndex];

    if (holding.quantity < quantity) {
      return next(
        new AppError(
          `Insufficient ${cryptoSymbol}. Available: ${holding.quantity}, Requested: ${quantity}`,
          400,
        ),
      );
    }

    // Add cash back to portfolio
    portfolio.cashBalance += totalValue;

    // Reduce holding quantity
    portfolio.holdings[holdingIndex].quantity -= quantity;

    // Remove holding if quantity hits 0
    if (portfolio.holdings[holdingIndex].quantity === 0) {
      portfolio.holdings.splice(holdingIndex, 1);
    }
  }

  await portfolio.save();

  // Create the transaction record
  const transaction = await Transaction.create({
    portfolioId,
    userId: req.user._id,
    type,
    cryptoSymbol: symbolUpper,
    cryptoName,
    cryptoImageUrl: cryptoImageUrl || "",
    quantity,
    pricePerCoin,
    totalValue,
    notes: notes || "",
    xpAwarded: type === "buy" ? 10 : 15,
  });

  // Award XP to user for the trade
  const User = require("../models/User");
  const user = await User.findById(req.user._id);
  user.totalXP += transaction.xpAwarded;
  user.updateRank();
  await user.save();

  // Check for newly unlocked achievements
  const newAchievements = await checkAchievements(req.user._id);

  res.status(201).json({
    success: true,
    data: transaction,
    updatedPortfolio: portfolio,
    newAchievements,
    xpAwarded: transaction.xpAwarded,
  });
});
