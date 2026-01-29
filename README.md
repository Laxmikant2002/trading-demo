# XPro Trading Platform

A full-stack trading platform with real-time capabilities, built with React frontend, Node.js/TypeScript backend, Python financial engine, and containerized with Docker.

## Project Structure

```
xpro-trading/
├── 📁 frontend/          # React application
│   ├── src/
│   ├── public/
│   └── package.json
│
├── 📁 backend/           # Node.js API server (merged into root)
│   ├── src/
│   └── package.json
│
├── 📁 python-engine/     # Python financial engine
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile*
│
├── 📁 shared/           # Shared types and constants
│   ├── types/
│   └── constants/
│
├── 📁 scripts/          # Database initialization scripts
│   └── init.sql
│
├── 📁 nginx/            # Nginx configuration
│   └── nginx.conf
│
├── docker-compose.yml
├── docker-compose.override.yml
├── docker-compose.prod.yml
├── Dockerfile*
├── .env.example
└── README.md
```

## Quick Start with Docker

### Prerequisites

- Docker & Docker Compose
- Git

### Installation & Running

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd xpro-trading
   ```

2. **Copy environment file**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your actual configuration values.

3. **Start the entire stack**

   ```bash
   docker-compose up --build
   ```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api
- Python Engine: http://localhost:8000
- Nginx: http://localhost

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Local Development

1. **Clone and setup**

   ```bash
   git clone <repository-url>
   cd xpro-trading
   cp .env.example .env
   ```

2. **Start infrastructure**

   ```bash
   docker-compose up -d postgres redis
   ```

3. **Install dependencies**

   ```bash
   npm install
   cd python-engine && pip install -r requirements.txt && cd ..
   ```

4. **Run database migrations**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start services**

   ```bash
   # Terminal 1: Backend API
   npm run dev

   # Terminal 2: Python Engine
   cd python-engine && python main.py

   # Terminal 3: Frontend (if separate)
   cd frontend && npm run dev
   ```

## Docker Commands

### Development

```bash
# Start all services in development mode
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# Start only database and cache
docker-compose up postgres redis

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production

```bash
# Start production stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Scale services
docker-compose up -d --scale node-api=3

# Update services
docker-compose up -d --build --no-deps node-api
```

### Database Management

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U admin -d trading_db

# Access Redis
docker-compose exec redis redis-cli

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

## Tech Stack

### Frontend

- React 18
- TypeScript
- Tailwind CSS
- Socket.io Client

### Backend

- Node.js 18
- TypeScript
- Express.js
- Socket.io with Redis adapter
- Prisma ORM with PostgreSQL
- Redis for caching and pub/sub
- JWT Authentication
- Rate limiting

### Python Engine

- Python 3.11
- FastAPI
- Pandas & NumPy
- CCXT for exchange integration
- Asyncio for concurrent operations

### Infrastructure

- Docker & Docker Compose
- PostgreSQL 15
- Redis 7
- Nginx for load balancing
- Health checks and monitoring

## 📚 API Documentation

The XPro Trading Platform provides comprehensive REST API documentation with OpenAPI 3.0 specification.

### 📖 Documentation Files

- **[OpenAPI 3.0 Specification](openapi.json)** - Complete API specification in JSON format
- **[API Documentation Guide](API_DOCUMENTATION.md)** - Detailed usage guide and examples
- **[Interactive API Docs](api-docs.html)** - Swagger UI for browsing and testing the API
- **[Postman Collection](XPro-Trading-API.postman_collection.json)** - Import into Postman for testing

### 🚀 Quick API Test

1. **View Interactive Documentation**

   ```bash
   # Open in browser
   open api-docs.html
   ```

2. **Import Postman Collection**
   - Open Postman
   - Import `XPro-Trading-API.postman_collection.json`
   - Set `base_url` variable to `http://localhost:3000/api`

3. **Test API Endpoints**

   ```bash
   # Health check
   curl http://localhost:3000/api/health

   # Get market data
   curl http://localhost:3000/api/market-data/AAPL
   ```

### 🔑 Authentication

All protected endpoints require JWT authentication:

```bash
# Include in request headers
Authorization: Bearer <your-jwt-token>
```

### 📊 Rate Limiting

- **General requests**: 100 per 15 minutes
- **Authentication**: 5 attempts per 15 minutes

Rate limit headers are included in responses.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://admin:password@localhost:5432/trading_db

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# APIs
TWELVE_DATA_API_KEY=your-api-key

# Services
TRADING_ENGINE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## Features

- ✅ Real-time trading with WebSocket
- ✅ Portfolio management
- ✅ Market data integration (Twelve Data API)
- ✅ User authentication & authorization
- ✅ Order matching engine
- ✅ Risk management
- ✅ Real-time notifications
- ✅ Containerized deployment
- ✅ Health monitoring
- ✅ Rate limiting
- ✅ Database migrations with Prisma

## API Documentation

### REST Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/trades` - Get user trades
- `POST /api/orders` - Create order
- `GET /api/market-data/:symbol` - Get market data

### WebSocket Events

- `price-update` - Real-time price updates
- `trade-executed` - Trade execution notifications
- `order-update` - Order status updates

## Development

### Code Quality

```bash
# Run linting
npm run lint

# Run tests
npm test

# Build for production
npm run build

# Type checking
npx tsc --noEmit
```

### Database

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name your-migration-name

# View database
npx prisma studio

# Reset database
npx prisma migrate reset
```

## Deployment

### Production Checklist

- [ ] Update environment variables
- [ ] Configure SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test load balancing
- [ ] Set up CI/CD pipeline

### SSL Configuration

Place SSL certificates in `nginx/ssl/` directory:

```
nginx/ssl/
├── certificate.crt
├── private.key
└── dhparam.pem
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Port already in use**

```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Database connection issues**

```bash
# Check if PostgreSQL is running
docker-compose ps postgres
# View logs
docker-compose logs postgres
```

**Redis connection issues**

```bash
# Check Redis
docker-compose exec redis redis-cli ping
```

## License

This project is licensed under the MIT License.

## Project Structure

```
xpro-trading/
├── 📁 frontend/          # Next.js React application
│   ├── src/
│   ├── public/
│   └── package.json
│
├── 📁 backend/           # Node.js API server
│   ├── src/
│   └── package.json
│
├── 📁 python-engine/     # Python financial engine
│   ├── trading_engine/
│   └── requirements.txt
│
├── 📁 shared/           # Shared types and constants
│   ├── types/
│   └── constants/
│
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB
- Redis

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd xpro-trading
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd ../backend
   npm install
   ```

4. **Install Python dependencies**
   ```bash
   cd ../python-engine
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start infrastructure (MongoDB & Redis)**

   ```bash
   docker-compose up -d mongo redis
   ```

2. **Start the backend**

   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend**

   ```bash
   cd frontend
   npm run dev
   ```

4. **Start the Python engine (optional)**
   ```bash
   cd python-engine
   python main.py
   ```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Tech Stack

### Frontend

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- TypeScript
- Express.js
- Socket.io
- MongoDB with Mongoose
- Redis
- JWT Authentication

### Python Engine

- Python 3.9+
- Pandas
- NumPy
- Financial calculations and risk management

## Features

- Real-time trading
- Portfolio management
- Market data integration
- User authentication
- Order matching engine
- Risk management
- WebSocket real-time updates

## Development

### Running Tests

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

### Building for Production

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build
```

## Docker

To run the entire stack with Docker:

```bash
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
