#!/usr/bin/env ts-node

import dotenv from "dotenv";
import sequelize from "../src/config/database";
import User from "../src/models/User";

dotenv.config();

async function createAdminUser() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log("Database connected");

    // Sync models
    await sequelize.sync();
    console.log("Models synced");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`ID: ${existingAdmin.id}`);
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      email: "admin@xprotrading.com",
      password: "Admin123!",
      firstName: "System",
      lastName: "Administrator",
      role: "admin",
      isVerified: true,
      isActive: true,
      demoBalance: 10000.0,
    });

    console.log("Admin user created successfully!");
    console.log(`Email: ${adminUser.email}`);
    console.log(`ID: ${adminUser.id}`);
    console.log(`Password: Admin123!`);
    console.log(
      "\n⚠️  IMPORTANT: Change the default password after first login!",
    );
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

createAdminUser();
