import mongoose from "mongoose";
import User from "../src/models/User";
import Asset from "../src/models/Asset";

async function seedData() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/xpro-trading",
  );

  // Seed users
  const users = [
    { email: "user1@example.com", password: "password1" },
    { email: "user2@example.com", password: "password2" },
  ];

  for (const user of users) {
    const existing = await User.findOne({ email: user.email });
    if (!existing) {
      await User.create(user);
    }
  }

  // Seed assets
  const assets = [
    { symbol: "AAPL", name: "Apple Inc.", type: "stock", currentPrice: 150.0 },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      type: "stock",
      currentPrice: 2500.0,
    },
  ];

  for (const asset of assets) {
    const existing = await Asset.findOne({ symbol: asset.symbol });
    if (!existing) {
      await Asset.create(asset);
    }
  }

  console.log("Data seeded successfully");
  process.exit(0);
}

seedData().catch(console.error);
