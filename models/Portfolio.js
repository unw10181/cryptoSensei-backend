const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Portfolio name is required"],
      trim: true,
      maxlength: [50, "Portfolio name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
    cashBalance: {
      type: Number,
      default: 10000, // Each portfolio starts with $10,000 virtual cash
      min: [0, "Cash balance cannot be negative"],
    },
    // Holdings is a map of symbol -> { quantity, avgBuyPrice }
    holdings: [
      {
        cryptoSymbol: { type: String, required: true, uppercase: true },
        cryptoName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
        avgBuyPrice: { type: Number, required: true },
        imageUrl: { type: String, default: "" },
        default: [],
      },
    ],
    totalInvested: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// total portfolio value (cash + holdings)
// currentValue of holdings must be calculated on the frontend using live prices
portfolioSchema.virtual("totalCostBasis").get(function () {
  if (!Array.isArray(this.holdings)) return 0;
  return this.holdings.reduce((acc, h) => acc + h.quantity * h.avgBuyPrice, 0);
});

module.exports = mongoose.model("Portfolio", portfolioSchema);
