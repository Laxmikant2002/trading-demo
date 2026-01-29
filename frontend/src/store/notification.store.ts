import { create } from "zustand";

export type NotificationType = "success" | "error" | "warning" | "info";
export type NotificationChannel = "toast" | "bell" | "both";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  channel: NotificationChannel;
  actionUrl?: string;
  actionLabel?: string;
  data?: any; // Additional data for specific notification types
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
  isActive: boolean;
  createdAt: number;
  triggeredAt?: number;
}

export interface NotificationState {
  // Notifications
  notifications: Notification[];
  unreadCount: number;

  // Price alerts
  priceAlerts: PriceAlert[];
  activeAlerts: PriceAlert[];

  // UI state
  showNotificationCenter: boolean;
  showToast: boolean;
  currentToast: Notification | null;
  showPriceAlertsSetup: boolean;

  // Actions
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Price alerts
  addPriceAlert: (alert: Omit<PriceAlert, "id" | "createdAt">) => void;
  removePriceAlert: (id: string) => void;
  togglePriceAlert: (id: string) => void;
  checkPriceAlerts: (symbol: string, currentPrice: number) => void;

  // UI actions
  toggleNotificationCenter: () => void;
  togglePriceAlertsSetup: () => void;
  showToastNotification: (notification: Notification) => void;
  hideToast: () => void;

  // Convenience methods for common notifications
  notifyTradeExecuted: (
    symbol: string,
    side: "buy" | "sell",
    quantity: number,
    price: number,
  ) => void;
  notifyOrderFailed: (symbol: string, reason: string) => void;
  notifyMarginWarning: (level: number) => void;
  notifyPriceAlert: (
    symbol: string,
    price: number,
    condition: "above" | "below",
  ) => void;

  // Utility
  getNotificationsByType: (type: NotificationType) => Notification[];
  getUnreadNotifications: () => Notification[];
}

// Mock data for initial state
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Trade Executed",
    message: "Successfully bought 0.5 BTC at $43,250.75",
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    read: false,
    channel: "both",
    actionUrl: "/portfolio",
    actionLabel: "View Portfolio",
  },
  {
    id: "2",
    type: "warning",
    title: "Margin Warning",
    message:
      "Your margin level is approaching 100%. Consider reducing positions.",
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    read: false,
    channel: "bell",
    actionUrl: "/portfolio",
    actionLabel: "Manage Positions",
  },
  {
    id: "3",
    type: "info",
    title: "Price Alert",
    message: "ETH has reached your target price of $2,650",
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    read: true,
    channel: "both",
  },
  {
    id: "4",
    type: "error",
    title: "Order Failed",
    message: "Failed to execute limit order for SOL due to insufficient funds",
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    read: true,
    channel: "toast",
  },
];

const mockPriceAlerts: PriceAlert[] = [
  {
    id: "1",
    symbol: "BTC",
    targetPrice: 45000,
    condition: "above",
    isActive: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
  {
    id: "2",
    symbol: "ETH",
    targetPrice: 2600,
    condition: "below",
    isActive: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.read).length,
  priceAlerts: mockPriceAlerts,
  activeAlerts: mockPriceAlerts.filter((a) => a.isActive),
  showNotificationCenter: false,
  showToast: false,
  currentToast: null,
  showPriceAlertsSetup: false,

  addNotification: (notificationData) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
    };

    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    // Show toast if channel includes toast
    if (notification.channel === "toast" || notification.channel === "both") {
      get().showToastNotification(notification);
    }
  },

  markAsRead: (id) =>
    set((state) => {
      const updatedNotifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.read).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  deleteNotification: (id) =>
    set((state) => {
      const updatedNotifications = state.notifications.filter(
        (n) => n.id !== id,
      );
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.read).length,
      };
    }),

  clearAllNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),

  addPriceAlert: (alertData) =>
    set((state) => {
      const alert: PriceAlert = {
        ...alertData,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      const updatedAlerts = [...state.priceAlerts, alert];
      return {
        priceAlerts: updatedAlerts,
        activeAlerts: updatedAlerts.filter((a) => a.isActive),
      };
    }),

  removePriceAlert: (id) =>
    set((state) => {
      const updatedAlerts = state.priceAlerts.filter((a) => a.id !== id);
      return {
        priceAlerts: updatedAlerts,
        activeAlerts: updatedAlerts.filter((a) => a.isActive),
      };
    }),

  togglePriceAlert: (id) =>
    set((state) => {
      const updatedAlerts = state.priceAlerts.map((a) =>
        a.id === id ? { ...a, isActive: !a.isActive } : a,
      );
      return {
        priceAlerts: updatedAlerts,
        activeAlerts: updatedAlerts.filter((a) => a.isActive),
      };
    }),

  checkPriceAlerts: (symbol, currentPrice) => {
    const { activeAlerts, addNotification } = get();

    activeAlerts
      .filter((alert) => alert.symbol === symbol)
      .forEach((alert) => {
        const shouldTrigger =
          (alert.condition === "above" && currentPrice >= alert.targetPrice) ||
          (alert.condition === "below" && currentPrice <= alert.targetPrice);

        if (shouldTrigger && !alert.triggeredAt) {
          // Mark alert as triggered
          set((state) => ({
            priceAlerts: state.priceAlerts.map((a) =>
              a.id === alert.id ? { ...a, triggeredAt: Date.now() } : a,
            ),
            activeAlerts: state.activeAlerts.map((a) =>
              a.id === alert.id ? { ...a, triggeredAt: Date.now() } : a,
            ),
          }));

          // Create notification
          addNotification({
            type: "info",
            title: "Price Alert Triggered",
            message: `${symbol} has reached your target price of $${alert.targetPrice.toLocaleString()}`,
            channel: "both",
            actionUrl: "/trading",
            actionLabel: "Start Trading",
            data: { alertId: alert.id, symbol, price: currentPrice },
          });
        }
      });
  },

  toggleNotificationCenter: () =>
    set((state) => ({
      showNotificationCenter: !state.showNotificationCenter,
    })),

  togglePriceAlertsSetup: () =>
    set((state) => ({
      showPriceAlertsSetup: !state.showPriceAlertsSetup,
    })),

  showToastNotification: (notification) => {
    set({ currentToast: notification, showToast: true });

    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      get().hideToast();
    }, 5000);
  },

  hideToast: () => set({ showToast: false, currentToast: null }),

  // Convenience methods for common notifications
  notifyTradeExecuted: (symbol, side, quantity, price) => {
    get().addNotification({
      type: "success",
      title: "Trade Executed",
      message: `Successfully ${side === "buy" ? "bought" : "sold"} ${quantity} ${symbol} at $${price.toLocaleString()}`,
      channel: "both",
      actionUrl: "/portfolio",
      actionLabel: "View Portfolio",
      data: { symbol, side, quantity, price },
    });
  },

  notifyOrderFailed: (symbol, reason) => {
    get().addNotification({
      type: "error",
      title: "Order Failed",
      message: `Failed to execute order for ${symbol}: ${reason}`,
      channel: "toast",
      actionUrl: "/trading",
      actionLabel: "Try Again",
      data: { symbol, reason },
    });
  },

  notifyMarginWarning: (level) => {
    get().addNotification({
      type: "warning",
      title: "Margin Warning",
      message: `Your margin level is at ${level}%. Consider reducing positions to avoid liquidation.`,
      channel: "bell",
      actionUrl: "/portfolio",
      actionLabel: "Manage Positions",
      data: { marginLevel: level },
    });
  },

  notifyPriceAlert: (symbol, price, condition) => {
    get().addNotification({
      type: "info",
      title: "Price Alert",
      message: `${symbol} has ${condition} your target price of $${price.toLocaleString()}`,
      channel: "both",
      actionUrl: "/trading",
      actionLabel: "Start Trading",
      data: { symbol, price, condition },
    });
  },

  getNotificationsByType: (type) =>
    get().notifications.filter((n) => n.type === type),

  getUnreadNotifications: () => get().notifications.filter((n) => !n.read),
}));
