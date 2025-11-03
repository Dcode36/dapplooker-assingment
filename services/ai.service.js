const { GoogleGenerativeAI } = require('@google/generative-ai');

const aiService = {
    /**
     * Generate AI-powered insights for token data
     * @param {object} tokenData - Token data from CoinGecko
     * @param {string} vsCurrency - Currency being used
     */
    async generateInsight(tokenData, vsCurrency = 'usd') {
        try {
            // Initialize Gemini client
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash-exp',
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                    responseMimeType: 'application/json'
                }
            });

            // Build structured prompt
            const systemInstruction = 'You are a cryptocurrency market analyst. Provide brief, objective insights based on the provided market data. Always respond with valid JSON containing "reasoning" and "sentiment" fields. Sentiment must be one of: "Bullish", "Bearish", or "Neutral".';
            const prompt = this.buildPrompt(tokenData, vsCurrency);
            
            // Combine system instruction with user prompt
            const fullPrompt = `${systemInstruction}\n\n${prompt}`;
            
            // Call Gemini API
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const aiResponse = response.text();

            // Parse AI response (handle both pure JSON and markdown-wrapped JSON)
            const insight = this.parseJSONResponse(aiResponse);

            // Validate response structure
            if (!insight.reasoning || !insight.sentiment) {
                throw new Error('Invalid AI response format: missing required fields');
            }

            // Validate sentiment value
            const validSentiments = ['Bullish', 'Bearish', 'Neutral'];
            if (!validSentiments.includes(insight.sentiment)) {
                insight.sentiment = 'Neutral'; // Default to Neutral if invalid
            }

            return {
                insight,
                model: {
                    provider: 'gemini',
                    model: 'gemini-2.0-flash-exp'
                }
            };
        } catch (error) {
            if (error.name === 'SyntaxError') {
                throw new Error('Failed to parse AI response as JSON');
            }
            throw new Error(`AI service error: ${error.message}`);
        }
    },

    /**
     * Parse JSON response, handling markdown-wrapped JSON
     * @param {string} response - AI response text
     * @returns {object} - Parsed JSON object
     */
    parseJSONResponse(response) {
        try {
            // First, try to parse as-is
            return JSON.parse(response);
        } catch (error) {
            // If that fails, try to extract JSON from markdown code blocks
            const jsonMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
            if (jsonMatch && jsonMatch[1]) {
                return JSON.parse(jsonMatch[1].trim());
            }
            
            // If still no match, try to find JSON object in the text
            const jsonObjectMatch = response.match(/\{[\s\S]*\}/);
            if (jsonObjectMatch) {
                return JSON.parse(jsonObjectMatch[0]);
            }
            
            throw error;
        }
    },

    /**
     * Build a structured prompt from token data
     * @param {object} tokenData - Token data from CoinGecko
     * @param {string} vsCurrency - Currency being used
     * @returns {string} - Formatted prompt for AI
     */
    buildPrompt(tokenData, vsCurrency) {
        const { name, symbol, market_data, historical_data } = tokenData;
        
        let prompt = `Analyze the following cryptocurrency market data for ${name} (${symbol.toUpperCase()}):\n\n`;
        
        // Current price and basic metrics
        prompt += `Current Price: $${market_data.current_price_usd?.toFixed(2) || 'N/A'}\n`;
        prompt += `Market Cap: $${market_data.market_cap_usd?.toLocaleString() || 'N/A'}\n`;
        prompt += `24h Volume: $${market_data.total_volume_usd?.toLocaleString() || 'N/A'}\n`;
        
        // Price changes
        if (market_data.price_change_percentage_24h !== null) {
            prompt += `24h Change: ${market_data.price_change_percentage_24h.toFixed(2)}%\n`;
        }
        if (market_data.price_change_percentage_7d !== null) {
            prompt += `7d Change: ${market_data.price_change_percentage_7d.toFixed(2)}%\n`;
        }
        if (market_data.price_change_percentage_30d !== null) {
            prompt += `30d Change: ${market_data.price_change_percentage_30d.toFixed(2)}%\n`;
        }
        
        // Supply metrics
        if (market_data.circulating_supply) {
            prompt += `Circulating Supply: ${market_data.circulating_supply.toLocaleString()}\n`;
        }
        if (market_data.total_supply) {
            prompt += `Total Supply: ${market_data.total_supply.toLocaleString()}\n`;
        }
        
        // ATH/ATL data
        if (market_data.ath) {
            prompt += `All-Time High: $${market_data.ath.toFixed(2)}`;
            if (market_data.ath_change_percentage) {
                prompt += ` (${market_data.ath_change_percentage.toFixed(2)}% from ATH)`;
            }
            prompt += '\n';
        }
        
        // Historical data summary
        if (historical_data && historical_data.prices) {
            const prices = historical_data.prices;
            const firstPrice = prices[0][1];
            const lastPrice = prices[prices.length - 1][1];
            const percentChange = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
            prompt += `\nHistorical Performance (${prices.length} days): ${percentChange}%\n`;
        }
        
        prompt += `\nProvide a brief analysis with your reasoning and overall sentiment (Bullish, Bearish, or Neutral). `;
        prompt += `Respond ONLY with valid JSON in this exact format: {"reasoning": "your analysis here", "sentiment": "Bullish|Bearish|Neutral"}`;
        
        return prompt;
    }
};

module.exports = aiService;

