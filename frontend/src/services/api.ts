import axios, { AxiosInstance, AxiosResponse } from "axios";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
const WS_BASE_URL = process.env.REACT_APP_WS_URL || "http://localhost:3000";

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// WebSocket connection
export class WebSocketService {
  private socket: any;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // Note: This would need socket.io-client for full implementation
      console.log("WebSocket connection attempted to:", WS_BASE_URL);
      // this.socket = io(WS_BASE_URL);
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect();
      }, this.reconnectInterval * this.reconnectAttempts);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  public subscribe(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public unsubscribe(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  public emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

// Export singleton instance
export const wsService = new WebSocketService();

// API Endpoints
export const endpoints = {
  // Auth
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    google: "/api/auth/google",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
  },

  // Trading
  trading: {
    market: "/api/trade/market",
    limit: "/api/trade/limit",
    stopLoss: "/api/trade/stop-loss",
    takeProfit: "/api/trade/take-profit",
    orders: "/api/trade/orders",
    cancel: (id: string) => `/api/trade/orders/${id}`,
  },

  // Market Data
  market: {
    prices: "/api/market/prices",
    price: (symbol: string) => `/api/market/prices/${symbol}`,
    history: (symbol: string) => `/api/market/history/${symbol}`,
    indicators: (symbol: string) => `/api/market/indicators/${symbol}`,
  },

  // Portfolio
  portfolio: {
    overview: "/api/portfolio/overview",
    positions: "/api/portfolio/positions",
    history: "/api/portfolio/history",
  },

  // Notifications
  notifications: {
    list: "/api/notifications",
    markRead: (id: string) => `/api/notifications/${id}/read`,
    preferences: "/api/notifications/preferences",
  },

  // Admin
  admin: {
    users: "/api/admin/users",
    user: (id: string) => `/api/admin/users/${id}`,
    resetBalance: (id: string) => `/api/admin/users/${id}/reset`,
    stats: "/api/admin/stats",
  },
};

export default api;
