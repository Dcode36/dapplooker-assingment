const mongoose = require('mongoose');

const tokenInsightSchema = new mongoose.Schema({
    source: { type: String, default: 'coingecko' },
    token: {
        id: { type: String, required: true, index: true },
        symbol: String,
        name: String,
        market_data: {
            current_price_usd: Number,
            market_cap_usd: Number,
            total_volume_usd: Number,
            price_change_percentage_24h: Number
        }
    },
    insight: {
        reasoning: String,
        sentiment: String
    },
    model: {
        provider: String,
        model: String
    }
}, {
    timestamps: true
});

const TokenInsight = mongoose.model('TokenInsight', tokenInsightSchema);

module.exports = TokenInsight;

