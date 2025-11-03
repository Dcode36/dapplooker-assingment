const axios = require('axios');

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

const coingeckoService = {
    /**
     * Fetch token metadata and market data from CoinGecko
     * @param {string} tokenId - CoinGecko token ID
     * @param {string} vsCurrency - Currency to compare against (default: usd)
     * @param {number} historyDays - Number of days for historical data (optional)
     */
    async fetchTokenData(tokenId, vsCurrency = 'usd', historyDays = null) {
        try {
            // Fetch main token data
            const tokenResponse = await axios.get(
                `${COINGECKO_BASE_URL}/coins/${tokenId}`,
                {
                    params: {
                        localization: false,
                        tickers: false,
                        community_data: false,
                        developer_data: false
                    }
                },
                {
                    headers: {
                        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
                    }
                }
            );

            const token = tokenResponse.data;
            
            // Extract relevant market data
            const marketData = {
                current_price_usd: token.market_data?.current_price?.[vsCurrency] || null,
                market_cap_usd: token.market_data?.market_cap?.[vsCurrency] || null,
                total_volume_usd: token.market_data?.total_volume?.[vsCurrency] || null,
                price_change_percentage_24h: token.market_data?.price_change_percentage_24h || null,
                price_change_percentage_7d: token.market_data?.price_change_percentage_7d || null,
                price_change_percentage_30d: token.market_data?.price_change_percentage_30d || null,
                high_24h: token.market_data?.high_24h?.[vsCurrency] || null,
                low_24h: token.market_data?.low_24h?.[vsCurrency] || null,
                circulating_supply: token.market_data?.circulating_supply || null,
                total_supply: token.market_data?.total_supply || null,
                max_supply: token.market_data?.max_supply || null,
                ath: token.market_data?.ath?.[vsCurrency] || null,
                ath_change_percentage: token.market_data?.ath_change_percentage?.[vsCurrency] || null,
                atl: token.market_data?.atl?.[vsCurrency] || null,
                atl_change_percentage: token.market_data?.atl_change_percentage?.[vsCurrency] || null
            };

            let historicalData = null;
            
            // Optionally fetch historical market data
            if (historyDays) {
                try {
                    const chartResponse = await axios.get(
                        `${COINGECKO_BASE_URL}/coins/${tokenId}/market_chart`,
                        {
                            params: {
                                vs_currency: vsCurrency,
                                days: historyDays
                            }
                        }
                    );
                    historicalData = chartResponse.data;
                } catch (error) {
                    console.warn('Failed to fetch historical data:', error.message);
                }
            }

            return {
                id: token.id,
                symbol: token.symbol,
                name: token.name,
                description: token.description?.en || '',
                market_data: marketData,
                historical_data: historicalData
            };
        } catch (error) {
            if (error.response) {
                throw new Error(`CoinGecko API Error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
            }
            throw new Error(`Failed to fetch token data: ${error.message}`);
        }
    }
};

module.exports = coingeckoService;

