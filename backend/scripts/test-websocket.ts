import { io } from "socket.io-client";

// Test WebSocket connections
async function testWebSocketServer() {
  const serverUrl = process.env.WEBSOCKET_URL || "http://localhost:3001";

  console.log("Testing WebSocket server at:", serverUrl);

  // Test 1: Basic connection
  const socket1 = io(serverUrl);

  socket1.on("connect", () => {
    console.log("✅ Socket 1 connected:", socket1.id);

    // Authenticate
    socket1.emit("authenticate", {
      userId: 1,
      email: "test@example.com"
    });

    // Subscribe to market data
    socket1.emit("subscribe-market-data", { symbols: ["BTC", "ETH"] });

    // Subscribe to notifications
    socket1.emit("subscribe-notifications");

    // Subscribe to trades
    socket1.emit("subscribe-trades");
  });

  socket1.on("authenticated", (data) => {
    console.log("✅ Authentication successful:", data);
  });

  socket1.on("market-data-initial", (data) => {
    console.log("📊 Initial market data received:", data.length, "symbols");
  });

  socket1.on("price-update", (data) => {
    console.log("💰 Price update:", data.symbol, data.price);
  });

  socket1.on("notification", (data) => {
    console.log("🔔 Notification:", data.title);
  });

  socket1.on("trade-update", (data) => {
    console.log("📈 Trade update:", data.type);
  });

  socket1.on("disconnect", (reason) => {
    console.log("❌ Socket 1 disconnected:", reason);
  });

  // Test 2: Multiple connections (simulate 1000+ connections)
  const connections = 10; // Reduced for testing, can be increased to 1000+
  const sockets = [socket1];

  for (let i = 0; i < connections - 1; i++) {
    const socket = io(serverUrl);
    sockets.push(socket);

    socket.on("connect", () => {
      console.log(`✅ Socket ${i + 2} connected:`, socket.id);
      socket.emit("authenticate", {
        userId: i + 2,
        email: `user${i + 2}@example.com`
      });
    });
  }

  // Monitor connection count
  setInterval(() => {
    const connectedCount = sockets.filter(s => s.connected).length;
    console.log(`📊 Connected sockets: ${connectedCount}/${connections}`);
  }, 5000);

  // Test chat functionality (future)
  socket1.on("connect", () => {
    setTimeout(() => {
      socket1.emit("subscribe-chat", "support-room-1");
      socket1.emit("send-chat-message", {
        roomId: "support-room-1",
        message: "Hello, I need help with trading!",
        type: "text"
      });
    }, 2000);
  });

  socket1.on("chat-message", (data) => {
    console.log("💬 Chat message:", data.message);
  });

  // Keep the test running
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down test...");
    sockets.forEach(socket => socket.disconnect());
    process.exit(0);
  });
}

// Run the test
testWebSocketServer().catch(console.error);