# XPro Trading Backend

A TypeScript-based backend for the XPro Trading application, featuring real-time trading capabilities, portfolio management, and market data integration.

## Features

- User authentication and authorization
- Real-time trading with order matching
- Portfolio management
- Market data integration
- WebSocket support for real-time updates
- Redis caching
- MongoDB for data persistence

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** for API
- **Socket.io** for real-time communication
- **MongoDB** with Mongoose
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

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/trading/orders` - Place an order
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
