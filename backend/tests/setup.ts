import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

// Setup test database and Redis
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL =
    "postgresql://admin:password@localhost:5432/trading_test_db";
  process.env.REDIS_URL = "redis://localhost:6380";
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.SESSION_SECRET = "test-session-secret";
});

afterAll(async () => {
  // Clean up - Redis only for now, Prisma will be handled by individual tests
  try {
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.disconnect();
  } catch (error) {
    // Redis might already be disconnected
  }
});
