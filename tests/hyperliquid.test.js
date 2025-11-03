const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test HyperLiquid PnL API
async function testHyperliquidPnLAPI() {
    console.log('\n=== Testing HyperLiquid PnL API ===\n');

    // Test 1: Valid wallet and date range
    console.log('Test 1: Valid wallet and date range');
    try {
        const wallet = '0x1234567890123456789012345678901234567890';
        const response = await axios.get(
            `${BASE_URL}/api/hyperliquid/${wallet}/pnl?start=2024-11-01&end=2024-11-03`
        );
        console.log('✅ Status:', response.status);
        console.log('✅ Wallet:', response.data.wallet);
        console.log('✅ Daily entries:', response.data.daily.length);
        console.log('✅ Net PnL:', response.data.summary.net_pnl_usd);
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 2: Invalid wallet format
    console.log('\nTest 2: Invalid wallet format');
    try {
        const response = await axios.get(
            `${BASE_URL}/api/hyperliquid/invalid-wallet/pnl?start=2024-11-01&end=2024-11-03`
        );
        console.log('Status:', response.status);
    } catch (error) {
        console.log('✅ Expected error:', error.response?.status);
        console.log('✅ Error message:', error.response?.data?.error);
    }

    // Test 3: Missing dates
    console.log('\nTest 3: Missing date parameters');
    try {
        const wallet = '0x1234567890123456789012345678901234567890';
        const response = await axios.get(`${BASE_URL}/api/hyperliquid/${wallet}/pnl`);
        console.log('Status:', response.status);
    } catch (error) {
        console.log('✅ Expected error:', error.response?.status);
        console.log('✅ Error message:', error.response?.data?.error);
    }

    // Test 4: Invalid date format
    console.log('\nTest 4: Invalid date format');
    try {
        const wallet = '0x1234567890123456789012345678901234567890';
        const response = await axios.get(
            `${BASE_URL}/api/hyperliquid/${wallet}/pnl?start=2024/11/01&end=2024/11/03`
        );
        console.log('Status:', response.status);
    } catch (error) {
        console.log('✅ Expected error:', error.response?.status);
        console.log('✅ Error message:', error.response?.data?.error);
    }

    // Test 5: Start date after end date
    console.log('\nTest 5: Start date after end date');
    try {
        const wallet = '0x1234567890123456789012345678901234567890';
        const response = await axios.get(
            `${BASE_URL}/api/hyperliquid/${wallet}/pnl?start=2024-11-10&end=2024-11-01`
        );
        console.log('Status:', response.status);
    } catch (error) {
        console.log('✅ Expected error:', error.response?.status);
        console.log('✅ Error message:', error.response?.data?.error);
    }

    // Test 6: Date range too large (>90 days)
    console.log('\nTest 6: Date range too large');
    try {
        const wallet = '0x1234567890123456789012345678901234567890';
        const response = await axios.get(
            `${BASE_URL}/api/hyperliquid/${wallet}/pnl?start=2024-01-01&end=2024-12-31`
        );
        console.log('Status:', response.status);
    } catch (error) {
        console.log('✅ Expected error:', error.response?.status);
        console.log('✅ Error message:', error.response?.data?.error);
    }

    // Test 7: Short date range (1 day)
    console.log('\nTest 7: Single day range');
    try {
        const wallet = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';
        const response = await axios.get(
            `${BASE_URL}/api/hyperliquid/${wallet}/pnl?start=2024-11-01&end=2024-11-01`
        );
        console.log('✅ Status:', response.status);
        console.log('✅ Daily entries:', response.data.daily.length);
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
}

// Run tests
async function runTests() {
    try {
        await testHyperliquidPnLAPI();
        console.log('\n=== All HyperLiquid Tests Completed ===\n');
    } catch (error) {
        console.error('Test suite error:', error.message);
    }
}

// Check if running directly
if (require.main === module) {
    runTests();
}

module.exports = { testHyperliquidPnLAPI };

