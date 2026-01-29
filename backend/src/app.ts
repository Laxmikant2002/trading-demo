import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import sequelize from "./config/database";
import passport from "./config/passport";
import { createClient } from "redis";
import { generalRateLimit } from "./api/middleware/rateLimit.middleware";
import { MarketDataService } from "./services/marketData.service";
import "./models/MarketData"; // Import to ensure table creation

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);

// Set Socket.IO instance for market data service
MarketDataService.setSocketIO(io);

// Database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected");
    await sequelize.sync(); // Sync models
  } catch (error) {
    console.error("Database connection error:", error);
  }
})();

// Redis connection
let redisClient;
(async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    await redisClient.connect();
    console.log("Redis connected");
  } catch (error) {
    console.log("Redis not available, skipping...");
    redisClient = null;
  }
})();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
app.use(generalRateLimit);

// Routes will be added here
import authRoutes from "./api/routes/auth.routes";
import marketDataRoutes from "./api/routes/marketData.routes";
import tradingRoutes from "./api/routes/trading.routes";
app.use("/api/auth", authRoutes);
app.use("/api/market-data", marketDataRoutes);
app.use("/api/trade", tradingRoutes);

// Socket.io setup
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Market data WebSocket handlers
  socket.on("subscribe-market-data", async () => {
    console.log(`User ${socket.id} subscribed to market data`);

    // Send initial data
    try {
      const marketData = await MarketDataService.getAllCachedMarketData();
      socket.emit("market-data-update", marketData);
    } catch (error) {
      console.error("Error sending initial market data:", error);
    }
  });

  socket.on("unsubscribe-market-data", () => {
    console.log(`User ${socket.id} unsubscribed from market data`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start market data scheduler
import { MarketDataScheduler } from "./schedulers/marketData.scheduler";
MarketDataScheduler.start();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
export default app;
