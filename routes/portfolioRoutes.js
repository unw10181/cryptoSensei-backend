const express = require("express");
const router = express.Router();
const {
  getPortfolios,
  createPortfolio,
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioPerformance,
} = require("../controllers/portfolioController");
const { protect } = require("../middleware/authMiddleware");

// All portfolio routes are protected
router.use(protect);

// GET  /api/portfolios         → get all portfolios for user
// POST /api/portfolios         → create new portfolio
router.route("/").get(getPortfolios).post(createPortfolio);

// GET    /api/portfolios/:id            → get single portfolio
// PUT    /api/portfolios/:id            → update portfolio
// DELETE /api/portfolios/:id            → delete portfolio
router
  .route("/:id")
  .get(getPortfolio)
  .put(updatePortfolio)
  .delete(deletePortfolio);

// GET /api/portfolios/:id/performance   → get performance metrics
router.get("/:id/performance", getPortfolioPerformance);

module.exports = router;
