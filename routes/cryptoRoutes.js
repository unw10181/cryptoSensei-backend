const express = require("express");
const router = express.Router();
const {
  getCryptoPrices,
  getCoinPrice,
  getCoinHistory,
  searchCrypto,
  getBatchPrices,
} = require("../controllers/cryptoController");
const { protect } = require("../middleware/authMiddleware");

// All crypto routes are protected
router.use(protect);

// GET  /api/crypto/prices              → top coins list
router.get("/prices", getCryptoPrices);

// GET  /api/crypto/search?query=       → search coins
router.get("/search", searchCrypto);

// POST /api/crypto/batch-prices        → prices for multiple coins
router.post("/batch-prices", getBatchPrices);

// GET  /api/crypto/price/:coinId       → single coin price
router.get("/price/:coinId", getCoinPrice);

// GET  /api/crypto/history/:coinId     → price chart history
router.get("/history/:coinId", getCoinHistory);

module.exports = router;
