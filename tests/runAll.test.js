const { testTokenInsightAPI } = require('./token.test');
const { testHyperliquidPnLAPI } = require('./hyperliquid.test');

async function runAllTests() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   Running All API Tests               ║');
    console.log('╚═══════════════════════════════════════╝');
    
    try {
        // Run Token API tests
        await testTokenInsightAPI();
        
        // Wait a bit before next test suite
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Run HyperLiquid API tests
        await testHyperliquidPnLAPI();
        
        console.log('\n');
        console.log('╔═══════════════════════════════════════╗');
        console.log('║   All Tests Completed!                ║');
        console.log('╚═══════════════════════════════════════╝');
        console.log('\n');
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        process.exit(1);
    }
}

runAllTests();

