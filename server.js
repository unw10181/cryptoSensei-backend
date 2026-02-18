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

// console.log({
//   authRoutes,
//   userRoutes,
//   portfolioRoutes,
//   transactionRoutes,
//   cryptoRoutes,
//   achievementRoutes,
// });

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://cryptosenseii.netlify.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, cb) {
    if (!origin) return cb(null, true); // Postman / server requests
    if (allowedOrigins.includes(origin)) return cb(null, true);
    console.log("Blocked by CORS:", origin);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ✅ Preflight for all routes (regex instead of "*")
app.options(/.*/, cors(corsOptions));

//pasring
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/crypto", cryptoRoutes);
app.use("/api/achievements", achievementRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "CryptoSensei API is running. Hayaku!" });
});

// Global Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 404 Error handling
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// DB connection and start
const PORT = process.env.PORT;

connectDb();

app.listen(PORT, () => {
  console.log(`CryptoSensei server running on port ${PORT}, Hayaku!`);
});
