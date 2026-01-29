import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { createClient } from "redis";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/xpro-trading")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

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

// Routes will be added here

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
