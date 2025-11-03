# DappLooker Assignment

Backend APIs for Token Insights and HyperLiquid Wallet PnL Analysis.

## 🚀 Features

### 1. Token Insight API
- Fetches token data from CoinGecko
- AI-powered market sentiment analysis using Google Gemini
- Stores results in MongoDB

### 2. HyperLiquid Wallet PnL API
- Fetches wallet trading data from HyperLiquid
- Calculates daily PnL, fees, and funding
- Stores results in MongoDB

---

## 🐳 Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dapplooker
```

### 2. Set Environment Variables
```bash
# Create .env file
cp .env.example .env

# Edit .env and add your GEMINI_API_KEY
nano .env
```

### 3. Start with Docker Compose
```bash
docker-compose up -d
```

That's it! The application is now running at `http://localhost:3000`

### Docker Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Stop and remove all data
docker-compose down -v
```

---

## 💻 Local Development (Without Docker)

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configuration
Create a `.env` file:

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# MongoDB
MONGO_URI=mongodb://localhost:27017/dapplooker

# Server
PORT=3000
```

### 3. Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 4. Run the Server
```bash
npm start
```

Server runs on `http://localhost:3000`

---

## 🧪 Running Tests

**Important:** Make sure the server is running before running tests!

### With Docker:
```bash
# In Terminal 1: Start services
docker-compose up -d

# Wait a few seconds for services to start, then run tests
npm test
```

### Without Docker:
```bash
# In Terminal 1: Start server
npm start

# In Terminal 2: Run tests
npm test
```

### Test Commands:
```bash
# Run all tests
npm test

# Run specific tests
npm run test:token        # Token API tests only
npm run test:hyperliquid  # HyperLiquid API tests only
```

---

## 📖 API Documentation

### **1. Token Insight API**

**Endpoint:** `POST /api/token/:id/insight`

**Example:**
```bash
curl -X POST http://localhost:3000/api/token/bitcoin/insight \
  -H "Content-Type: application/json" \
  -d '{
    "vs_currency": "usd",
    "history_days": 30
  }'
```

**Response:**
```json
{
  "source": "coingecko",
  "token": {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "market_data": {
      "current_price_usd": 35000,
      "market_cap_usd": 680000000000,
      "total_volume_usd": 25000000000,
      "price_change_percentage_24h": 2.5
    }
  },
  "insight": {
    "reasoning": "Bitcoin shows strong momentum...",
    "sentiment": "Bullish"
  },
  "model": {
    "provider": "gemini",
    "model": "gemini-2.0-flash-exp"
  }
}
```

---

### **2. HyperLiquid Wallet PnL API**

**Endpoint:** `GET /api/hyperliquid/:wallet/pnl?start=YYYY-MM-DD&end=YYYY-MM-DD`

**Example:**
```bash
curl "http://localhost:3000/api/hyperliquid/0x1234567890123456789012345678901234567890/pnl?start=2024-11-01&end=2024-11-03"
```

**Response:**
```json
{
  "wallet": "0x1234567890123456789012345678901234567890",
  "start": "2024-11-01",
  "end": "2024-11-03",
  "daily": [
    {
      "date": "2024-11-01",
      "realized_pnl_usd": 120.5,
      "unrealized_pnl_usd": -15.3,
      "fees_usd": 2.1,
      "funding_usd": -0.5,
      "net_pnl_usd": 102.6,
      "equity_usd": 10102.6
    }
  ],
  "summary": {
    "total_realized_usd": 120.5,
    "total_unrealized_usd": -15.3,
    "total_fees_usd": 2.1,
    "total_funding_usd": -0.5,
    "net_pnl_usd": 102.6
  },
  "diagnostics": {
    "data_source": "hyperliquid_api",
    "last_api_call": "2024-11-03T12:00:00Z",
    "notes": "PnL calculated using daily close prices"
  }
}
```

---

## 📊 MongoDB Collections

### `tokeninsights`
Stores all token insight API results.

### `hyperliquidpnls`
Stores all HyperLiquid PnL calculations.


## ✅ Test Coverage

### Token API Tests:
- ✅ Valid token (Bitcoin)
- ✅ Valid token (Ethereum)
- ✅ Invalid token
- ✅ Empty token ID

### HyperLiquid API Tests:
- ✅ Valid wallet and date range
- ✅ Invalid wallet format
- ✅ Missing date parameters
- ✅ Invalid date format
- ✅ Start date after end date
- ✅ Date range too large (>90 days)
- ✅ Single day range

---

## 🛠️ Technologies Used

- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Axios** - HTTP client
- **Google Gemini AI** - AI insights
- **CoinGecko API** - Token data
- **HyperLiquid API** - Trading data

---

## 📝 Notes

- Both APIs automatically save results to MongoDB
- Token Insight API uses Google Gemini for AI analysis
- HyperLiquid PnL supports up to 90-day date ranges
- All monetary values are in USD

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Client/Tests  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Express Server │
│   (Port 3000)   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ MongoDB │ │ External APIs│
│         │ │ - CoinGecko  │
│         │ │ - Gemini AI  │
│         │ │ - HyperLiquid│
└─────────┘ └──────────────┘
```

---

## 📂 Project Structure

```
dapplooker/
├── config/
│   └── db.config.js           # MongoDB connection
├── controller/
│   ├── token.controller.js    # Token API logic
│   └── hyperliquid.controller.js # HyperLiquid API logic
├── model/
│   ├── tokenInsight.model.js  # Token data schema
│   └── hyperliquid.model.js   # PnL data schema
├── routes/
│   ├── token.routes.js        # Token routes
│   └── hyperliquid.routes.js  # HyperLiquid routes
├── services/
│   ├── coingecko.service.js   # CoinGecko API
│   ├── ai.service.js          # Gemini AI service
│   ├── hyperliquid.service.js # HyperLiquid API
│   └── pnl.service.js         # PnL calculations
├── tests/
│   ├── token.test.js          # Token API tests
│   ├── hyperliquid.test.js    # HyperLiquid tests
│   └── runAll.test.js         # Run all tests
├── Dockerfile                 # Docker image config
├── docker-compose.yml         # Docker services
├── .dockerignore             # Docker ignore file
├── .env.example              # Environment template
├── postman_collection.json   # Postman collection
├── server.js                 # Entry point
└── package.json              # Dependencies
```



## 👤 Author

Built for DappLooker Assignment

