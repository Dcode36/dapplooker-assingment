const hyperliquidService = require('./hyperliquid.service');

const pnlService = {
    async calculateDailyPnL(wallet, startDate, endDate) {
        // Fetch data from HyperLiquid
        const walletData = await hyperliquidService.fetchWalletData(wallet);
        
        // Create daily buckets for date range
        const dailyMap = this.createDateBuckets(startDate, endDate);
        
        // Fill in the data from HyperLiquid
        this.processTrades(walletData.fills, dailyMap);
        this.processFunding(walletData.funding, dailyMap);
        
        // Get unrealized PnL from open positions
        const unrealizedPnL = this.getUnrealizedPnL(walletData.userState);
        
        // Calculate net PnL and equity for each day
        const daily = this.calculateDaily(dailyMap, unrealizedPnL);
        
        // Return response
        return {
            wallet,
            start: startDate,
            end: endDate,
            daily,
            summary: this.calculateSummary(daily),
            diagnostics: {
                data_source: 'hyperliquid_api',
                last_api_call: new Date().toISOString(),
                notes: 'PnL calculated using daily close prices'
            }
        };
    },

    createDateBuckets(start, end) {
        const dailyMap = new Map();
        const current = new Date(start);
        const endDate = new Date(end);
        
        while (current <= endDate) {
            dailyMap.set(current.toISOString().split('T')[0], {
                date: current.toISOString().split('T')[0],
                realized_pnl_usd: 0,
                unrealized_pnl_usd: 0,
                fees_usd: 0,
                funding_usd: 0
            });
            current.setDate(current.getDate() + 1);
        }
        return dailyMap;
    },

    processTrades(fills, dailyMap) {
        if (!fills) return;
        
        fills.forEach(fill => {
            const date = new Date(fill.time).toISOString().split('T')[0];
            const day = dailyMap.get(date);
            
            if (day && fill.closedPnl) {
                day.realized_pnl_usd += parseFloat(fill.closedPnl) || 0;
            }
            
            if (day && fill.fee) {
                day.fees_usd += Math.abs(parseFloat(fill.fee)) || 0;
            }
        });
    },

    processFunding(funding, dailyMap) {
        if (!funding) return;
        
        funding.forEach(entry => {
            const date = new Date(entry.time).toISOString().split('T')[0];
            const day = dailyMap.get(date);
            
            if (day && entry.delta) {
                day.funding_usd += parseFloat(entry.delta) || 0;
            }
        });
    },

    getUnrealizedPnL(userState) {
        if (!userState?.assetPositions) return 0;
        
        return userState.assetPositions.reduce((total, pos) => {
            return total + (parseFloat(pos.position?.unrealizedPnl) || 0);
        }, 0);
    },

    calculateDaily(dailyMap, unrealizedPnL) {
        const daily = Array.from(dailyMap.values());
        let equity = 10000; // Starting equity
        
        // Add unrealized PnL to last day
        if (daily.length > 0) {
            daily[daily.length - 1].unrealized_pnl_usd = unrealizedPnL;
        }
        
        // Calculate net PnL and equity
        daily.forEach((day, i) => {
            day.net_pnl_usd = day.realized_pnl_usd + day.unrealized_pnl_usd - day.fees_usd + day.funding_usd;
            day.equity_usd = equity;
            equity += day.net_pnl_usd;
            
            // Round to 2 decimals
            day.realized_pnl_usd = Math.round(day.realized_pnl_usd * 100) / 100;
            day.unrealized_pnl_usd = Math.round(day.unrealized_pnl_usd * 100) / 100;
            day.fees_usd = Math.round(day.fees_usd * 100) / 100;
            day.funding_usd = Math.round(day.funding_usd * 100) / 100;
            day.net_pnl_usd = Math.round(day.net_pnl_usd * 100) / 100;
            day.equity_usd = Math.round(day.equity_usd * 100) / 100;
        });
        
        return daily;
    },

    calculateSummary(daily) {
        const summary = {
            total_realized_usd: 0,
            total_unrealized_usd: 0,
            total_fees_usd: 0,
            total_funding_usd: 0,
            net_pnl_usd: 0
        };
        
        daily.forEach(day => {
            summary.total_realized_usd += day.realized_pnl_usd;
            summary.total_fees_usd += day.fees_usd;
            summary.total_funding_usd += day.funding_usd;
        });
        
        if (daily.length > 0) {
            summary.total_unrealized_usd = daily[daily.length - 1].unrealized_pnl_usd;
        }
        
        summary.net_pnl_usd = summary.total_realized_usd + summary.total_unrealized_usd 
                             - summary.total_fees_usd + summary.total_funding_usd;
        
        // Round all
        Object.keys(summary).forEach(key => {
            summary[key] = Math.round(summary[key] * 100) / 100;
        });
        
        return summary;
    }
};

module.exports = pnlService;

