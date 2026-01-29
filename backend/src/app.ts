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

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);

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
app.use("/api/auth", authRoutes);

// Socket.io setup
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  // Socket handlers will be added here
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
