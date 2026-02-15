const dotenv = require("dotenv");
const express = require("express");
const connectDb = require("./config/db");

//ENV Config
dotenv.config();

const app = express();
connectDb();

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const cryptoRoutes = require("./routes/cryptoRoutes");
const achievementRoutes = require("./routes/achievementRoutes");

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "CryptoSensei API is running. Hayaku!" });
});

app.express();

// Middleware
app.use(express.urlencoded({ extended: true }));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`),
);
