const coingeckoService = require('../services/coingecko.service');
const aiService = require('../services/ai.service');
const TokenInsight = require('../model/tokenInsight.model');

const tokenController = {
    fetchTokenData: async (req, res) => {
        const { id } = req.params;
        const tokenData = await Token.findById(id);
        res.json(tokenData);
    },

    /**
     * Token Insight API - Combines CoinGecko data with AI-powered insights
     * POST /api/token/:id/insight
     */
    getTokenInsight: async (req, res) => {
        try {
            const { id } = req.params;
            const { vs_currency = 'usd', history_days = null } = req.body;

            // Validate token ID
            if (!id) {
                return res.status(400).json({
                    error: 'Token ID is required'
                });
            }

            // Step 1: Fetch token data from CoinGecko
            const tokenData = await coingeckoService.fetchTokenData(
                id,
                vs_currency,
                history_days
            );

            // Step 2 & 3: Build prompt and call AI service
            const aiResult = await aiService.generateInsight(tokenData, vs_currency);

            // Step 4 & 5: Return combined output
            const response = {
                source: 'coingecko',
                token: {
                    id: tokenData.id,
                    symbol: tokenData.symbol,
                    name: tokenData.name,
                    market_data: {
                        current_price_usd: tokenData.market_data.current_price_usd,
                        market_cap_usd: tokenData.market_data.market_cap_usd,
                        total_volume_usd: tokenData.market_data.total_volume_usd,
                        price_change_percentage_24h: tokenData.market_data.price_change_percentage_24h
                    }
                },
                insight: aiResult.insight,
                model: aiResult.model
            };

            // Save to MongoDB
            try {
                await TokenInsight.create(response);
            } catch (dbError) {
                console.error('Failed to save to database:', dbError.message);
            }

            res.status(200).json(response);
        } catch (error) {
            console.error('Token Insight Error:', error.message);
            
            // Handle specific error types
            if (error.message.includes('CoinGecko API Error')) {
                return res.status(502).json({
                    error: 'Failed to fetch token data from CoinGecko',
                    details: error.message
                });
            }
            
            if (error.message.includes('AI service error')) {
                return res.status(502).json({
                    error: 'Failed to generate AI insights',
                    details: error.message
                });
            }

            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
};

module.exports = tokenController;