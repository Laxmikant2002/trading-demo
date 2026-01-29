-- Initialize database for XPro Trading platform

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if it doesn't exist (this will be handled by environment variables)
-- The database 'trading_db' is created via POSTGRES_DB environment variable

-- Create indexes for better performance (these will be created by Prisma migrations)
-- This file is mainly for any custom initialization if needed

-- Set timezone
SET timezone = 'UTC';

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';