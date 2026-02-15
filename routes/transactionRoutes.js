const express = require("express");
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  getTransaction,
  deleteTransaction,
  getAllUserTransactions,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

// All transaction routes are protected
router.use(protect);

// GET  /api/transactions/user/all  → all transactions for logged-in user
router.get("/user/all", getAllUserTransactions);

// GET  /api/transactions/portfolio/:portfolioId  → all transactions for a portfolio
router.get("/portfolio/:portfolioId", getTransactions);

// POST /api/transactions           → create buy or sell transaction
router.post("/", createTransaction);

// GET    /api/transactions/:id     → get single transaction
// DELETE /api/transactions/:id     → delete transaction
router.route("/:id").get(getTransaction).delete(deleteTransaction);

module.exports = router;
