const mongoose = require('mongoose');

const dailyPnLSchema = new mongoose.Schema({
    date: { type: String, required: true },
    realized_pnl_usd: { type: Number, default: 0 },
    unrealized_pnl_usd: { type: Number, default: 0 },
    fees_usd: { type: Number, default: 0 },
    funding_usd: { type: Number, default: 0 },
    net_pnl_usd: { type: Number, default: 0 },
    equity_usd: { type: Number, default: 0 }
});

const hyperliquidPnLSchema = new mongoose.Schema({
    wallet: { type: String, required: true, index: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    daily: [dailyPnLSchema],
    summary: {
        total_realized_usd: { type: Number, default: 0 },
        total_unrealized_usd: { type: Number, default: 0 },
        total_fees_usd: { type: Number, default: 0 },
        total_funding_usd: { type: Number, default: 0 },
        net_pnl_usd: { type: Number, default: 0 }
    },
    diagnostics: {
        data_source: String,
        last_api_call: String,
        notes: String
    }
}, {
    timestamps: true
});

// Index for faster queries
hyperliquidPnLSchema.index({ wallet: 1, start: 1, end: 1 });

const HyperliquidPnL = mongoose.model('HyperliquidPnL', hyperliquidPnLSchema);

module.exports = HyperliquidPnL;

