const pnlService = require('../services/pnl.service');
const HyperliquidPnL = require('../model/hyperliquid.model');

const hyperliquidController = {
    /**
     * Get daily PnL for a wallet
     * GET /api/hyperliquid/:wallet/pnl?start=YYYY-MM-DD&end=YYYY-MM-DD
     */
    getWalletPnL: async (req, res) => {
        try {
            const { wallet } = req.params;
            const { start, end } = req.query;

            // Validate wallet address
            if (!wallet) {
                return res.status(400).json({
                    error: 'Wallet address is required'
                });
            }

            // Validate wallet format (basic Ethereum address validation)
            if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
                return res.status(400).json({
                    error: 'Invalid wallet address format. Expected Ethereum address (0x...)'
                });
            }

            // Validate date parameters
            if (!start || !end) {
                return res.status(400).json({
                    error: 'Both start and end date parameters are required (format: YYYY-MM-DD)'
                });
            }

            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(start) || !dateRegex.test(end)) {
                return res.status(400).json({
                    error: 'Invalid date format. Use YYYY-MM-DD'
                });
            }

            // Validate date range
            const startDate = new Date(start);
            const endDate = new Date(end);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    error: 'Invalid date values'
                });
            }

            if (startDate > endDate) {
                return res.status(400).json({
                    error: 'Start date must be before or equal to end date'
                });
            }

            // Check if date range is too large (max 90 days)
            const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            if (daysDiff > 90) {
                return res.status(400).json({
                    error: 'Date range too large. Maximum 90 days allowed'
                });
            }

            // Calculate PnL
            const pnlData = await pnlService.calculateDailyPnL(wallet, start, end);

            // Save to MongoDB
            try {
                await HyperliquidPnL.create(pnlData);
            } catch (dbError) {
                console.error('Failed to save to database:', dbError.message);
            }

            res.status(200).json(pnlData);
        } catch (error) {
            console.error('HyperLiquid PnL Error:', error.message);

            // Handle specific error types
            if (error.message.includes('Failed to fetch')) {
                return res.status(502).json({
                    error: 'Failed to fetch data from HyperLiquid API',
                    details: error.message
                });
            }

            if (error.message.includes('Invalid date')) {
                return res.status(400).json({
                    error: 'Invalid date format or range',
                    details: error.message
                });
            }

            if (error.message.includes('No data found')) {
                return res.status(404).json({
                    error: 'No trading data found for this wallet',
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

module.exports = hyperliquidController;

