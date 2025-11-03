const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test Token Insight API
async function testTokenInsightAPI() {
    console.log('\n=== Testing Token Insight API ===\n');

    // Test 1: Valid token (Bitcoin)
    console.log('Test 1: Valid token (Bitcoin)');
    try {
        console.log("Test id : 1000bonk")
        const response = await axios.post(`${BASE_URL}/api/token/1000bonk/insight`, {
            vs_currency: 'usd',
            history_days: 30
        });
        console.log('✅ Status:', response.status);
        console.log('✅ Token:', response.data.token.name);
        console.log('✅ Sentiment:', response.data.insight.sentiment);
        console.log('✅ Price:', `$${response.data.token.market_data.current_price_usd}`);
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 2: Valid token (Ethereum)
    console.log('\nTest 2: Valid token (Ethereum)');
    try {
        const response = await axios.post(`${BASE_URL}/api/token/ethereum/insight`, {
            vs_currency: 'usd'
        });
        console.log('✅ Status:', response.status);
        console.log('✅ Token:', response.data.token.name);
        console.log('✅ Sentiment:', response.data.insight.sentiment);
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 3: Invalid token
    console.log('\nTest 3: Invalid token');
    try {
        const response = await axios.post(`${BASE_URL}/api/token/invalid-token-xyz/insight`, {});
        console.log('✅ Status:', response.status);
    } catch (error) {
        console.log('✅ Expected error:', error.response?.status);
        console.log('✅ Error message:', error.response?.data?.error);
    }

    // Test 4: Empty token ID
    console.log('\nTest 4: Without token ID');
    try {
        const response = await axios.post(`${BASE_URL}/api/token//insight`, {});
        console.log('Status:', response.status);
    } catch (error) {
        console.log('✅ Expected error:', error.response?.status);
    }
}

// Run tests
async function runTests() {
    try {
        await testTokenInsightAPI();
        console.log('\n=== All Token Tests Completed ===\n');
    } catch (error) {
        console.error('Test suite error:', error.message);
    }
}

// Check if running directly
if (require.main === module) {
    runTests();
}

module.exports = { testTokenInsightAPI };

