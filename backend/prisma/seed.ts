import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create demo users
  const demoUser1 = await prisma.user.upsert({
    where: { email: "demo1@example.com" },
    update: {},
    create: {
      email: "demo1@example.com",
      password: "$2b$10$hashedpassword1", // This would be properly hashed
      demoBalance: 10000,
    },
  });

  const demoUser2 = await prisma.user.upsert({
    where: { email: "demo2@example.com" },
    update: {},
    create: {
      email: "demo2@example.com",
      password: "$2b$10$hashedpassword2", // This would be properly hashed
      demoBalance: 15000,
    },
  });

  // Create sample trades
  await prisma.trade.createMany({
    data: [
      {
        userId: demoUser1.id,
        symbol: "BTC",
        side: "BUY",
        quantity: 0.5,
        entryPrice: 45000,
        status: "OPEN",
      },
      {
        userId: demoUser1.id,
        symbol: "ETH",
        side: "SELL",
        quantity: 2.0,
        entryPrice: 3000,
        exitPrice: 3200,
        pnl: 400,
        status: "CLOSED",
        closedAt: new Date(),
      },
      {
        userId: demoUser2.id,
        symbol: "SOL",
        side: "BUY",
        quantity: 10,
        entryPrice: 100,
        status: "OPEN",
      },
    ],
  });

  // Create sample orders
  await prisma.order.createMany({
    data: [
      {
        userId: demoUser1.id,
        type: "LIMIT",
        status: "PENDING",
        symbol: "BTC",
        side: "BUY",
        quantity: 0.25,
        price: 44000,
      },
      {
        userId: demoUser1.id,
        type: "STOP",
        status: "PENDING",
        symbol: "ETH",
        side: "SELL",
        quantity: 1.0,
        price: 2900,
        stopLoss: 2800,
      },
      {
        userId: demoUser2.id,
        type: "MARKET",
        status: "FILLED",
        symbol: "SOL",
        side: "SELL",
        quantity: 5,
        filledAt: new Date(),
      },
    ],
  });

  console.log("Database seeded successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
