import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  side: 'long' | 'short';
  entryTime: Date;
  lastUpdate: Date;
}

export interface PortfolioStats {
  totalBalance: number;
  availableBalance: number;
  marginUsed: number;
  marginLevel: number;
  unrealizedPnL: number;
  realizedPnL: number;
  totalPnL: number;
  winTrades: number;
  lossTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
}

export interface TradeHistory {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: Date;
  realizedPnL?: number;
}

export interface EquityPoint {
  timestamp: Date;
  equity: number;
  balance: number;
  unrealizedPnL: number;
}

export interface PortfolioState {
  // Portfolio overview
  stats: PortfolioStats;

  // Open positions
  positions: Position[];

  // Trade history
  tradeHistory: TradeHistory[];

  // Equity curve data
  equityCurve: EquityPoint[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  updateStats: (stats: Partial<PortfolioStats>) => void;
  updatePositions: (positions: Position[]) => void;
  addPosition: (position: Position) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  closePosition: (id: string) => void;
  addTrade: (trade: TradeHistory) => void;
  updateEquityCurve: (points: EquityPoint[]) => void;
  exportToCSV: () => string;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock data
const mockStats: PortfolioStats = {
  totalBalance: 10000,
  availableBalance: 8500,
  marginUsed: 1500,
  marginLevel: 666.67, // (equity / margin used) * 100
  unrealizedPnL: 245.67,
  realizedPnL: 1234.56,
  totalPnL: 1480.23,
  winTrades: 12,
  lossTrades: 8,
  winRate: 60,
  avgWin: 156.78,
  avgLoss: -89.34,
  profitFactor: 2.1,
  maxDrawdown: -450.23,
};

const mockPositions: Position[] = [
  {
    id: '1',
    symbol: 'BTC',
    quantity: 0.5,
    entryPrice: 42000,
    currentPrice: 43250.75,
    marketValue: 21625.38,
    unrealizedPnL: 625.38,
    unrealizedPnLPercent: 2.97,
    side: 'long',
    entryTime: new Date('2024-01-15T10:30:00'),
    lastUpdate: new Date(),
  },
  {
    id: '2',
    symbol: 'ETH',
    quantity: 5,
    entryPrice: 2500,
    currentPrice: 2650.30,
    marketValue: 13251.50,
    unrealizedPnL: 751.50,
    unrealizedPnLPercent: 6.01,
    side: 'long',
    entryTime: new Date('2024-01-14T14:20:00'),
    lastUpdate: new Date(),
  },
  {
    id: '3',
    symbol: 'SOL',
    quantity: 20,
    entryPrice: 95,
    currentPrice: 98.45,
    marketValue: 1969.00,
    unrealizedPnL: 69.00,
    unrealizedPnLPercent: 3.63,
    side: 'long',
    entryTime: new Date('2024-01-16T09:15:00'),
    lastUpdate: new Date(),
  },
];

const mockTradeHistory: TradeHistory[] = [
  {
    id: '1',
    symbol: 'BTC',
    side: 'buy',
    quantity: 0.5,
    price: 42000,
    timestamp: new Date('2024-01-15T10:30:00'),
  },
  {
    id: '2',
    symbol: 'ETH',
    side: 'sell',
    quantity: 3,
    price: 2550,
    timestamp: new Date('2024-01-14T11:45:00'),
    realizedPnL: 150,
  },
  {
    id: '3',
    symbol: 'SOL',
    side: 'buy',
    quantity: 20,
    price: 95,
    timestamp: new Date('2024-01-16T09:15:00'),
  },
];

// Generate mock equity curve data
const generateEquityCurve = (): EquityPoint[] => {
  const points: EquityPoint[] = [];
  const startDate = new Date('2024-01-01');
  let equity = 10000;

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Simulate some P&L changes
    const dailyChange = (Math.random() - 0.5) * 200;
    equity += dailyChange;

    points.push({
      timestamp: date,
      equity: Math.max(9500, equity), // Don't go below 9500
      balance: Math.max(9500, equity - (Math.random() * 500)), // Some unrealized P&L
      unrealizedPnL: Math.random() * 300 - 150,
    });
  }

  return points;
};

export const usePortfolioStore = create<PortfolioState>()(
  devtools(
    (set, get) => ({
      stats: mockStats,
      positions: mockPositions,
      tradeHistory: mockTradeHistory,
      equityCurve: generateEquityCurve(),
      isLoading: false,
      error: null,

      updateStats: (stats) =>
        set((state) => ({
          stats: { ...state.stats, ...stats },
        })),

      updatePositions: (positions) => set({ positions }),

      addPosition: (position) =>
        set((state) => ({
          positions: [...state.positions, position],
        })),

      updatePosition: (id, updates) =>
        set((state) => ({
          positions: state.positions.map((pos) =>
            pos.id === id ? { ...pos, ...updates } : pos
          ),
        })),

      closePosition: (id) =>
        set((state) => ({
          positions: state.positions.filter((pos) => pos.id !== id),
        })),

      addTrade: (trade) =>
        set((state) => ({
          tradeHistory: [trade, ...state.tradeHistory],
        })),

      updateEquityCurve: (points) => set({ equityCurve: points }),

      exportToCSV: () => {
        const state = get();
        const csvData = [
          // Positions CSV
          ['Positions'],
          ['Symbol', 'Quantity', 'Entry Price', 'Current Price', 'Market Value', 'Unrealized P&L', 'P&L %'],
          ...state.positions.map(pos => [
            pos.symbol,
            pos.quantity.toString(),
            pos.entryPrice.toString(),
            pos.currentPrice.toString(),
            pos.marketValue.toString(),
            pos.unrealizedPnL.toString(),
            pos.unrealizedPnLPercent.toString(),
          ]),
          [''],
          // Trade History CSV
          ['Trade History'],
          ['Symbol', 'Side', 'Quantity', 'Price', 'Timestamp', 'Realized P&L'],
          ...state.tradeHistory.map(trade => [
            trade.symbol,
            trade.side,
            trade.quantity.toString(),
            trade.price.toString(),
            trade.timestamp.toISOString(),
            trade.realizedPnL?.toString() || '',
          ]),
        ];

        return csvData.map(row => row.join(',')).join('\n');
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),
    }),
    { name: 'portfolio-store' }
  )
);