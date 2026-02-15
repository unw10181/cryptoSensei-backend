const axios = require("axios");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");

const COINGECKO_BASE =
  process.env.COINGECKO_BASE_URL || "https://api.coingecko.com/api/v3"; //ENV api does not work.

  
