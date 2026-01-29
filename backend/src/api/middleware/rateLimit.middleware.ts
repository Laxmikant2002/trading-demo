import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient, RedisClientType } from "redis";

// Create Redis client for rate limiting
let redisClient: RedisClientType | null = null;
try {
  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });
  redisClient.connect().catch(() => {
    console.log("Redis not available for rate limiting, using memory store");
    redisClient = null;
  });
} catch (error) {
  redisClient = null;
}

// General rate limiter (100 requests per 15 minutes)
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args: string[]) =>
          (redisClient as RedisClientType).sendCommand(args),
      })
    : undefined,
});

// Auth rate limiter (5 attempts per 15 minutes)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args: string[]) =>
          (redisClient as RedisClientType).sendCommand(args),
      })
    : undefined,
});
