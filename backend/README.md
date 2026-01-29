# XPro Trading Backend

A TypeScript-based backend for the XPro Trading application, featuring comprehensive authentication, real-time market data, and trading capabilities.

## Features

- JWT-based user authentication with OAuth (Google)
- Real-time market data for BTC, ETH, SOL with 15-minute caching
- Technical indicators (MA 20/50, RSI 14)
- WebSocket simulation for real-time updates
- PostgreSQL for data persistence
- Redis for caching and session management
- Rate limiting and security middleware

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** for API
- **Socket.io** for real-time communication
- **PostgreSQL** with Sequelize ORM
- **Redis** for caching
- **Twelve Data API** for market data
- **Redis** for caching
- **Python** engine for financial calculations

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

3. Start MongoDB and Redis (or use Docker):

   ```bash
   docker-compose up -d mongo redis
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/profile` - Get user profile (authenticated)

### Market Data

- `GET /api/market-data` - Get all symbols market data
- `GET /api/market-data/:symbol` - Get specific symbol market data
- `GET /api/market-data/:symbol/history` - Get historical data
- `POST /api/market-data/update` - Trigger manual update (admin only)

### WebSocket Events

- `subscribe-market-data` - Subscribe to real-time market data updates
- `market-data-update` - Receive market data updates (every 15 minutes)

Market data response format:

```json
{
  "symbol": "BTC",
  "price": 65000.5,
  "change_24h": 2.5,
  "high_24h": 65500,
  "low_24h": 64500,
  "timestamp": "2024-01-15T10:15:00Z",
  "isDelayed": true,
  "ma_20": 64800.25,
  "ma_50": 64200.75,
  "rsi_14": 65.5
}
```

- `GET /api/trading/orders` - Get user orders
- `GET /api/market/data/:symbol` - Get market data

## Scripts

- `npm run build` - Build TypeScript
- `npm run start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests

## Python Engine

The Python engine handles complex financial calculations. To run it:

```bash
cd python-engine
pip install -r requirements.txt
python main.py
```
