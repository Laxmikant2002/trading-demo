import { create } from "zustand";

export interface Asset {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change24h: number;
  volume24h: number;
}

export interface OrderForm {
  type: "market" | "limit";
  side: "buy" | "sell";
  amount: string;
  price: string;
  stopLoss: string;
  takeProfit: string;
}

export interface Balance {
  available: number;
  total: number;
  currency: string;
}

export interface TradingState {
  // Selected asset
  selectedAsset: Asset | null;
  assets: Asset[];

  // Order form
  orderForm: OrderForm;

  // Balance
  balance: Balance;

  // Real-time data
  currentPrice: number;
  priceChange: number;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedAsset: (asset: Asset) => void;
  updateOrderForm: (updates: Partial<OrderForm>) => void;
  updateBalance: (balance: Balance) => void;
  updatePrice: (price: number, change: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetOrderForm: () => void;
}

const initialOrderForm: OrderForm = {
  type: "market",
  side: "buy",
  amount: "",
  price: "",
  stopLoss: "",
  takeProfit: "",
};

const initialAssets: Asset[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "₿",
    price: 43250.75,
    change24h: 2.34,
    volume24h: 28400000000,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    price: 2650.3,
    change24h: -1.23,
    volume24h: 15200000000,
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "◎",
    price: 98.45,
    change24h: 5.67,
    volume24h: 3200000000,
  },
];

const initialBalance: Balance = {
  available: 10000,
  total: 10000,
  currency: "USD",
};

export const useTradingStore = create<TradingState>((set, get) => ({
  selectedAsset: initialAssets[0],
  assets: initialAssets,
  orderForm: initialOrderForm,
  balance: initialBalance,
  currentPrice: initialAssets[0].price,
  priceChange: initialAssets[0].change24h,
  isLoading: false,
  error: null,

  setSelectedAsset: (asset) =>
    set({
      selectedAsset: asset,
      currentPrice: asset.price,
      priceChange: asset.change24h,
    }),

  updateOrderForm: (updates) =>
    set((state) => ({
      orderForm: { ...state.orderForm, ...updates },
    })),

  updateBalance: (balance) => set({ balance }),

  updatePrice: (price, change) =>
    set({ currentPrice: price, priceChange: change }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  resetOrderForm: () => set({ orderForm: initialOrderForm }),
}));
