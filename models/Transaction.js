const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    portfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Portfolio",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["buy", "sell"],
      required: [true, "Transaction type is required"],
    },
    cryptoSymbol: {
      type: String,
      required: [true, "Crypto symbol is required"],
      uppercase: true,
      trim: true,
    },
    cryptoName: {
      type: String,
      required: [true, "Crypto name is required"],
      trim: true,
    },
    cryptoImageUrl: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.00000001, "Quantity must be greater than 0"],
    },
    pricePerCoin: {
      type: Number,
      required: [true, "Price per coin is required"],
      min: [0, "Price cannot be negative"],
    },
    totalValue: {
      type: Number,
      required: true, // quantity * pricePerCoin
    },
    // XP awarded for this transaction
    xpAwarded: {
      type: Number,
      default: 10,
    },
    notes: {
      type: String,
      maxlength: [200, "Notes cannot exceed 200 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Auto-calculate totalValue before save 
transactionSchema.pre('save', function (next) {
  this.totalValue = this.quantity * this.pricePerCoin;
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
