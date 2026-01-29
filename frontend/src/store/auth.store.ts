import { create } from "zustand";

// Types
export interface User {
  id: string;
  email: string;
  demoBalance: number;
  marginLevel?: number;
  role: "user" | "admin";
  createdAt: string;
  lastReset?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

// Actions
export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuthToken: () => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Store
export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // State
  user: null as User | null,
  token: null as string | null,
  refreshToken: null as string | null,
  isLoading: false,
  error: null as string | null,

  // Actions
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const { user, token, refreshToken } = data;

      set({
        user,
        token,
        refreshToken,
        isLoading: false,
      });

      // Store tokens in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Registration failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      refreshToken: null,
      error: null,
    });

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  },

  refreshAuthToken: async () => {
    const { refreshToken: currentRefreshToken } = get();

    if (!currentRefreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Token refresh failed");
      }

      const { token, refreshToken: newRefreshToken } = data;

      set({
        token,
        refreshToken: newRefreshToken,
      });

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", newRefreshToken);
    } catch (error) {
      // If refresh fails, logout user
      get().logout();
      throw error;
    }
  },

  googleLogin: async (googleToken: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google login failed");
      }

      const { user, token, refreshToken } = data;

      set({
        user,
        token,
        refreshToken,
        isLoading: false,
      });

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Google login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to send reset email");
      }

      set({ isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to send reset email",
        isLoading: false,
      });
      throw error;
    }
  },

  resetPassword: async (resetToken: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: resetToken, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Password reset failed");
      }

      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Password reset failed",
        isLoading: false,
      });
      throw error;
    }
  },

  setUser: (user: User) => set({ user }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
