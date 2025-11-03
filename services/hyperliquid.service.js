const axios = require('axios');

const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/info';

const hyperliquidService = {
    async fetchWalletData(wallet) {
        try {
            // We only need 3 API calls:
            // 1. userFills - for trades (realized PnL + fees)
            // 2. clearinghouseState - for open positions (unrealized PnL)
            // 3. userFunding - for funding payments
            
            const [fills, userState, funding] = await Promise.all([
                axios.post(HYPERLIQUID_API_URL, {
                    type: 'userFills',
                    user: wallet
                }),
                axios.post(HYPERLIQUID_API_URL, {
                    type: 'clearinghouseState',
                    user: wallet
                }),
                axios.post(HYPERLIQUID_API_URL, {
                    type: 'userFunding',
                    user: wallet
                })
            ]);

            return {
                fills: fills.data || [],
                userState: userState.data || {},
                funding: funding.data || []
            };
        } catch (error) {
            throw new Error(`Failed to fetch wallet data: ${error.message}`);
        }
    }
};

module.exports = hyperliquidService;

