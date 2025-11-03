const express = require('express');
const hyperliquidController = require('../controller/hyperliquid.controller');
const router = express.Router();

// Get wallet daily PnL
router.get('/:wallet/pnl', hyperliquidController.getWalletPnL);

module.exports = router;

