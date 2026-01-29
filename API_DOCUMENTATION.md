# XPro Trading Platform API Documentation

This document provides comprehensive OpenAPI 3.0 documentation for the XPro Trading Platform REST API.

## 📋 Overview

The XPro Trading Platform API provides endpoints for:

- User authentication and account management
- Real-time trading operations
- Portfolio management and analytics
- Market data access
- Administrative functions

## 🔗 API Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.xprotrading.com`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Rate Limiting

- **General requests**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 attempts per 15 minutes

Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## 📊 Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "error": "Error description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## 🚀 Quick Start

### 1. Register a new account

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Login to get JWT tokens

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 3. Place a market order

```bash
curl -X POST http://localhost:3000/api/trade/market \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "side": "buy",
    "quantity": 10
  }'
```

### 4. Get portfolio information

```bash
curl -X GET http://localhost:3000/api/trade/portfolio \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📈 WebSocket Real-time Updates

The platform provides real-time updates via WebSocket connections:

### Connection URL

```
ws://localhost:3000/socket.io/
```

### Events

#### Price Updates

```javascript
socket.on("price-update", (data) => {
  console.log("Price update:", data);
  // { symbol: 'AAPL', price: 150.25, change: 2.50, changePercent: 1.69 }
});
```

#### Trade Notifications

```javascript
socket.on("trade-executed", (data) => {
  console.log("Trade executed:", data);
  // { orderId: '123', symbol: 'AAPL', side: 'buy', quantity: 10, price: 150.25 }
});
```

#### Order Updates

```javascript
socket.on("order-update", (data) => {
  console.log("Order update:", data);
  // { orderId: '123', status: 'filled', filledQuantity: 10 }
});
```

## 🏷️ API Endpoints Summary

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/change-password` - Change password
- `GET /auth/profile` - Get user profile
- `GET /auth/verify-email/{token}` - Verify email

### Trading Endpoints

- `POST /trade/market` - Place market order
- `POST /trade/limit` - Place limit order
- `POST /trade/stop-loss` - Set stop loss
- `POST /trade/take-profit` - Set take profit
- `GET /trade/orders` - Get user orders
- `GET /trade/positions` - Get user positions

### Portfolio Endpoints

- `GET /trade/portfolio` - Get portfolio summary
- `GET /trade/portfolio/overview` - Get detailed overview
- `GET /trade/portfolio/history` - Get portfolio history

### Market Data Endpoints

- `GET /market-data` - Get all market data
- `GET /market-data/{symbol}` - Get specific symbol data
- `GET /market-data/{symbol}/history` - Get historical data

### Admin Endpoints (Admin only)

- `GET /admin/users` - List all users
- `GET /admin/users/{userId}` - Get user details
- `POST /admin/users/{userId}/reset-balance` - Reset user balance
- `PATCH /admin/users/{userId}/status` - Toggle user status
- `GET /admin/assets` - Get tradable assets
- `POST /admin/assets` - Add tradable asset
- `DELETE /admin/assets/{symbol}` - Remove tradable asset
- `GET /admin/metrics` - Get system metrics
- `GET /admin/reports/usage` - Get usage statistics

## 📝 Data Types

### Order Types

- `market` - Execute immediately at current market price
- `limit` - Execute only at specified price or better
- `stop-loss` - Sell if price drops to stop price
- `take-profit` - Sell if price rises to target price

### Order Sides

- `buy` - Purchase order
- `sell` - Sell order

### Order Status

- `pending` - Order submitted, waiting execution
- `filled` - Order completely executed
- `cancelled` - Order cancelled by user
- `rejected` - Order rejected by system

### Asset Types

- `stock` - Stock/equity
- `crypto` - Cryptocurrency
- `forex` - Foreign exchange
- `commodity` - Commodity/futures

## 🔧 Development

### Using the OpenAPI Specification

1. **View in Swagger UI**: Import `openapi.json` into Swagger UI
2. **Generate Client SDKs**: Use OpenAPI Generator to create client libraries
3. **API Testing**: Use tools like Postman or Insomnia with the OpenAPI spec

### Code Generation Examples

**Generate TypeScript client:**

```bash
npx openapi-generator-cli generate \
  -i openapi.json \
  -g typescript-axios \
  -o generated-client
```

**Generate Python client:**

```bash
npx openapi-generator-cli generate \
  -i openapi.json \
  -g python \
  -o generated-client
```

## 🛡️ Security Best Practices

1. **Always use HTTPS** in production
2. **Store JWT tokens securely** (httpOnly cookies recommended)
3. **Implement token refresh** before expiration
4. **Validate input data** on both client and server
5. **Use rate limiting** to prevent abuse
6. **Log security events** for monitoring

## 📞 Support

- **Documentation**: [Full API Reference](openapi.json)
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

## 📄 License

This API documentation is part of the XPro Trading Platform and is licensed under the MIT License.
