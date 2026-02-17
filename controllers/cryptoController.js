const axios = require("axios");
const { asyncHandler, AppError } = require("../middleware/errMiddleware");

const COINGECKO_BASE =
  process.env.COINGECKO_BASE_URL || "https://api.coingecko.com/api/v3";

/**
 * Simple in-memory cache (good for local + Render single instance)
 * Keys -> { value, expiresAt }
 */
const cache = new Map();

function now() {
  return Date.now();
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < now()) return null;
  return entry.value;
}

function setCache(key, value, ttlMs) {
  cache.set(key, { value, expiresAt: now() + ttlMs });
}

/** return stale value even if expired (grace window) */
function getStaleCache(key, graceMs = 5 * 60_000) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt + graceMs < now()) return null;
  return entry.value;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * CoinGecko fetch with:
 * - retry on 429 with exponential backoff
 * - optional cache
 * - stale cache fallback when rate-limited
 */
async function cgGet({ url, params, cacheKey, ttlMs }) {
  if (cacheKey) {
    const cached = getCache(cacheKey);
    if (cached) return cached;
  }

  const maxRetries = 5; // ⬅️ increased
  let attempt = 0;
  let lastErr = null;

  while (attempt <= maxRetries) {
    try {
      const res = await axios.get(url, {
        params,
        timeout: 12_000,
        headers: {
          "User-Agent": "CryptoSensei/1.0 (education project)",
        },
      });

      if (cacheKey && ttlMs) setCache(cacheKey, res.data, ttlMs);
      return res.data;
    } catch (e) {
      lastErr = e;
      const status = e?.response?.status;

      // Retry on rate-limit (429) or transient 5xx
      if (status === 429 || (status >= 500 && status <= 599)) {
        // If we have stale cache, return it immediately to keep UI working
        if (cacheKey) {
          const stale = getStaleCache(cacheKey, 10 * 60_000); // allow up to 10 min stale
          if (stale) return stale;
        }

        const retryAfterHeader = e?.response?.headers?.["retry-after"];
        const retryAfterMs = retryAfterHeader
          ? Number(retryAfterHeader) * 1000
          : null;

        // exponential backoff with cap
        const backoffMs = retryAfterMs ?? Math.min(12_000, 700 * 2 ** attempt);
        await sleep(backoffMs);
        attempt += 1;
        continue;
      }

      // Non-retryable error
      throw e;
    }
  }

  // Retries exhausted. Return stale if possible
  if (cacheKey) {
    const stale = getStaleCache(cacheKey, 15 * 60_000);
    if (stale) return stale;
  }

  throw lastErr;
}

/**
 * GET /api/crypto/prices?perPage=20&page=1
 * Cache: 60 seconds (reduced spam; still feels “real-time”)
 */
const getCryptoPrices = asyncHandler(async (req, res, next) => {
  const { page = 1, perPage = 20 } = req.query;
  const cacheKey = `markets:${page}:${perPage}`;

  const data = await cgGet({
    url: `${COINGECKO_BASE}/coins/markets`,
    params: {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: perPage,
      page,
      sparkline: false,
      price_change_percentage: "24h",
    },
    cacheKey,
    ttlMs: 60_000, // ⬅️ was 30_000
  });

  const coins = (data || []).map((coin) => ({
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

/**
 * GET /api/crypto/price/:coinId
 * Cache: 60 seconds (trade simulator doesn’t need per-second pricing)
 */
const getCoinPrice = asyncHandler(async (req, res, next) => {
  const { coinId } = req.params;
  const cacheKey = `price:${coinId.toLowerCase()}`;

  const data = await cgGet({
    url: `${COINGECKO_BASE}/coins/markets`,
    params: {
      vs_currency: "usd",
      ids: coinId.toLowerCase(),
      sparkline: false,
      price_change_percentage: "24h,7d",
    },
    cacheKey,
    ttlMs: 60_000,
  });

  if (!data || data.length === 0) {
    return next(new AppError(`Coin "${coinId}" not found`, 404));
  }

  const coin = data[0];

  res.status(200).json({
    success: true,
    data: {
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      priceChange24h: coin.price_change_24h,
      priceChangePercentage24h: coin.price_change_percentage_24h,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
    },
  });
});

/**
 * GET /api/crypto/history/:coinId?days=7
 * Cache: 10 minutes (history doesn’t need frequent refresh)
 */
const getCoinHistory = asyncHandler(async (req, res, next) => {
  const { coinId } = req.params;
  const { days = 7 } = req.query;

  const cacheKey = `history:${coinId.toLowerCase()}:${days}`;

  const data = await cgGet({
    url: `${COINGECKO_BASE}/coins/${coinId.toLowerCase()}/market_chart`,
    params: { vs_currency: "usd", days },
    cacheKey,
    ttlMs: 10 * 60_000, // ⬅️ was 5*60_000
  });

  const priceHistory = (data?.prices || []).map(([timestamp, price]) => ({
    timestamp,
    date: new Date(timestamp).toLocaleDateString(),
    price: parseFloat(Number(price).toFixed(2)),
  }));

  res.status(200).json({
    success: true,
    coinId,
    days,
    data: priceHistory,
  });
});

/**
 * GET /api/crypto/search?query=btc
 * Cache: 60 seconds per query
 */
const searchCrypto = asyncHandler(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new AppError("Please provide a search query", 400));
  }

  const q = String(query).trim().toLowerCase();
  const cacheKey = `search:${q}`;

  const data = await cgGet({
    url: `${COINGECKO_BASE}/search`,
    params: { query: q },
    cacheKey,
    ttlMs: 60_000, // ⬅️ was 30_000
  });

  const results = (data?.coins || []).slice(0, 10).map((coin) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    image: coin.thumb,
    marketCapRank: coin.market_cap_rank,
  }));

  res.status(200).json({
    success: true,
    count: results.length,
    data: results,
  });
});

/**
 * POST /api/crypto/batch-prices { coinIds: ["bitcoin","ethereum"] }
 * Cache: 30 seconds for same set
 */
const getBatchPrices = asyncHandler(async (req, res, next) => {
  const { coinIds } = req.body;

  if (!coinIds || !Array.isArray(coinIds) || coinIds.length === 0) {
    return next(new AppError("Please provide an array of coin IDs", 400));
  }

  const ids = [...new Set(coinIds.map((x) => String(x).toLowerCase()))].sort();
  const cacheKey = `batch:${ids.join(",")}`;

  const data = await cgGet({
    url: `${COINGECKO_BASE}/simple/price`,
    params: {
      ids: ids.join(","),
      vs_currencies: "usd",
      include_24hr_change: true,
      include_market_cap: true,
    },
    cacheKey,
    ttlMs: 30_000,
  });

  res.status(200).json({ success: true, data });
});

module.exports = {
  getCryptoPrices,
  getCoinPrice,
  getCoinHistory,
  searchCrypto,
  getBatchPrices,
};
