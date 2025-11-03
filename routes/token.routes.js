const express = require('express');
const tokenController = require('../controller/token.controller');
const router = express.Router();

router.get('/coins/:id', tokenController.fetchTokenData);

// Token Insight API endpoint
router.post('/:id/insight', tokenController.getTokenInsight);

module.exports = router;