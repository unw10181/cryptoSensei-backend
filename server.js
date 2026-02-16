const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");

//ENV Config
dotenv.config();

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const cryptoRoutes = require("./routes/cryptoRoutes");
const achievementRoutes = require("./routes/achievementRoutes");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check (BEFORE API routes) ────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "CryptoSensei API is running. Hayaku!" });
});

// ─── API Routes ───────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/crypto", cryptoRoutes);
app.use("/api/achievements", achievementRoutes);

// ─── 404 Handler (MUST BE AFTER ALL ROUTES) ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler (MUST BE LAST) ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── DB Connection & Server Start ────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDb();

app.listen(PORT, () => {
  console.log(`CryptoSensei server running on port ${PORT}, Hayaku!`);
});
