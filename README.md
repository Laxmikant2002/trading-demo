# XPro Trading Platform

A full-stack trading platform with real-time capabilities, built with Next.js frontend, Node.js/TypeScript backend, and Python financial engine.

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
