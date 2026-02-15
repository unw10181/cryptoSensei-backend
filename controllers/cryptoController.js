const axios = require("axios");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");

const COINGECKO_BASE =
  process.env.COINGECKO_BASE_URL || "https://api.coingecko.com/api/v3"; //ENV api does not work.

// Retrieve top 100 coins in API
// GET /api/crypto/prices
const getCryptoPrices = asyncHandler(async (req, res, next) => {
  const { page = 1, perPage = 20 } = req.query;

  const response = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
    params: {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: perPage,
      page,
      sparkline: false,
      price_change_percentage: "24h",
    },
  });

  const coins = response.data.map((coin) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    image: coin.image,
    currentPrice: coin.current_price,
    marketCap: coin.market_cap,
    priceChange24h: coin.price_change_24h,
    priceChangePercentage24h: coin.price_change_percentage_24h,
    totalVolume: coin.total_volume,
    high24h: coin.high_24h,
    low24h: coin.low_24h,
  }));

  res.status(200).json({ success: true, count: coins.length, data: coins });
});

// Get current price for specific coins
// GET /api/crypto/price/:coinId
