import { Server, Socket } from "socket.io";
import redisAdapter from "socket.io-redis";
import { createClient } from "redis";
import { NotificationService } from "./notification.service";
import { MarketDataService } from "./marketData.service";

interface UserSocket extends Socket {
  userId?: number;
  userEmail?: string;
}

export class WebSocketService {
  private static io: Server | null = null;
  private static redisClient: ReturnType<typeof createClient> | null = null;
  private static priceUpdateInterval: NodeJS.Timeout | null = null;

  static initialize(io: Server) {
    this.io = io;
    this.setupRedisAdapter();
    this.setupSocketHandlers();
    this.startPriceUpdates();
  }

  private static setupRedisAdapter() {
    if (!this.io) return;

    try {
      // Create Redis clients for pub/sub
      const pubClient = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
      });
      const subClient = pubClient.duplicate();

      // Connect Redis clients
      pubClient.connect();
      subClient.connect();

      // Set up Redis adapter for scaling
      // this.io.adapter(redisAdapter({ pubClient, subClient }));

      console.log(
        "Redis clients initialized (adapter commented out for compatibility)",
      );
    } catch (error) {
      console.warn(
        "Redis adapter not available, running in single-instance mode:",
        error,
      );
    }
  }

  private static setupSocketHandlers() {
    if (!this.io) return;

    this.io.on("connection", (socket: UserSocket) => {
      console.log(`User connected: ${socket.id}`);

      // Authentication middleware
      socket.on("authenticate", (data: { token: string }) => {
        try {
          // In a real implementation, you'd verify the JWT token here
          // For now, we'll accept the userId from the client
          const { userId, email } = data as any;
          socket.userId = userId;
          socket.userEmail = email;

          socket.emit("authenticated", { success: true });
          console.log(`User ${socket.id} authenticated as user ${userId}`);
        } catch (error) {
          socket.emit("authentication_error", { error: "Invalid token" });
        }
      });

      // Market Data Subscriptions
      socket.on("subscribe-market-data", (data?: { symbols?: string[] }) => {
        const symbols = data?.symbols || ["BTC", "ETH", "SOL"];
        symbols.forEach((symbol) => {
          socket.join(`market-${symbol}`);
        });
        console.log(
          `User ${socket.id} subscribed to market data: ${symbols.join(", ")}`,
        );

        // Send current market data
        this.sendCurrentMarketData(socket);
      });

      socket.on("unsubscribe-market-data", (data?: { symbols?: string[] }) => {
        const symbols = data?.symbols || ["BTC", "ETH", "SOL"];
        symbols.forEach((symbol) => {
          socket.leave(`market-${symbol}`);
        });
        console.log(
          `User ${socket.id} unsubscribed from market data: ${symbols.join(", ")}`,
        );
      });

      // Trade Updates
      socket.on("subscribe-trades", () => {
        if (socket.userId) {
          socket.join(`trades-${socket.userId}`);
          console.log(
            `User ${socket.id} subscribed to trade updates for user ${socket.userId}`,
          );
        }
      });

      socket.on("unsubscribe-trades", () => {
        if (socket.userId) {
          socket.leave(`trades-${socket.userId}`);
          console.log(
            `User ${socket.id} unsubscribed from trade updates for user ${socket.userId}`,
          );
        }
      });

      // Notifications
      socket.on("subscribe-notifications", () => {
        if (socket.userId) {
          socket.join(`notifications-${socket.userId}`);
          console.log(
            `User ${socket.id} subscribed to notifications for user ${socket.userId}`,
          );
        }
      });

      socket.on("unsubscribe-notifications", () => {
        if (socket.userId) {
          socket.leave(`notifications-${socket.userId}`);
          console.log(
            `User ${socket.id} unsubscribed from notifications for user ${socket.userId}`,
          );
        }
      });

      // Chat/Support (future implementation)
      socket.on("subscribe-chat", (roomId: string) => {
        socket.join(`chat-${roomId}`);
        console.log(`User ${socket.id} joined chat room: ${roomId}`);
      });

      socket.on("unsubscribe-chat", (roomId: string) => {
        socket.leave(`chat-${roomId}`);
        console.log(`User ${socket.id} left chat room: ${roomId}`);
      });

      socket.on(
        "send-chat-message",
        (data: { roomId: string; message: string; type?: string }) => {
          // Future implementation for chat messages
          console.log(
            `Chat message from ${socket.id} in room ${data.roomId}: ${data.message}`,
          );
          socket.to(`chat-${data.roomId}`).emit("chat-message", {
            from: socket.userId,
            message: data.message,
            timestamp: new Date(),
            type: data.type || "text",
          });
        },
      );

      // Ping/Pong for connection health
      socket.on("ping", () => {
        socket.emit("pong");
      });

      socket.on("disconnect", (reason) => {
        console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
      });
    });
  }

  private static startPriceUpdates() {
    // Broadcast price updates every 5 seconds
    this.priceUpdateInterval = setInterval(async () => {
      try {
        await this.broadcastPriceUpdates();
      } catch (error) {
        console.error("Error broadcasting price updates:", error);
      }
    }, 5000);

    console.log("Price update broadcasting started (every 5 seconds)");
  }

  private static async broadcastPriceUpdates() {
    if (!this.io) return;

    try {
      // Get latest market data
      const marketData = await MarketDataService.getAllCachedMarketData();

      // Broadcast to all connected clients subscribed to each symbol
      for (const data of marketData) {
        this.io!.to(`market-${data.symbol}`).emit("price-update", {
          symbol: data.symbol,
          price: data.price,
          change: data.change,
          changePercent: data.changePercent,
          timestamp: new Date(),
        });
      }

      // Also broadcast to general market-data room for backward compatibility
      this.io!.to("market-data").emit("market-data-update", marketData);
    } catch (error) {
      console.error("Error in price update broadcast:", error);
    }
  }

  private static async sendCurrentMarketData(socket: UserSocket) {
    try {
      const marketData = await MarketDataService.getAllCachedMarketData();
      socket.emit("market-data-initial", marketData);
    } catch (error) {
      console.error("Error sending initial market data:", error);
      socket.emit("market-data-error", { error: "Failed to load market data" });
    }
  }

  // Public methods for other services to use
  static broadcastToUser(userId: number, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`notifications-${userId}`).emit(event, data);
    this.io.to(`trades-${userId}`).emit(event, data);
  }

  static broadcastTradeUpdate(userId: number, tradeData: any) {
    if (!this.io) return;
    this.io.to(`trades-${userId}`).emit("trade-update", {
      ...tradeData,
      timestamp: new Date(),
    });
  }

  static broadcastNotification(userId: number, notification: any) {
    if (!this.io) return;
    this.io.to(`notifications-${userId}`).emit("notification", {
      ...notification,
      timestamp: new Date(),
    });
  }

  static broadcastPriceAlert(userId: number, alertData: any) {
    if (!this.io) return;
    this.io.to(`notifications-${userId}`).emit("price-alert", {
      ...alertData,
      timestamp: new Date(),
    });
  }

  static broadcastSystemNotification(message: string, type: string = "info") {
    if (!this.io) return;
    this.io.emit("system-notification", {
      message,
      type,
      timestamp: new Date(),
    });
  }

  static broadcastToRoom(room: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
  }

  static getConnectedClientsCount(): number {
    return this.io?.sockets.sockets.size || 0;
  }

  static getRooms(): string[] {
    if (!this.io) return [];
    const rooms = new Set<string>();
    for (const [socketId, socket] of this.io.sockets.sockets) {
      socket.rooms.forEach((room) => rooms.add(room));
    }
    return Array.from(rooms);
  }

  static stop() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }
    console.log("WebSocket service stopped");
  }
}
