import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: "./prisma/migrations",
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://username:password@localhost:5432/xpro_trading",
});
