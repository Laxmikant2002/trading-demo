import { create } from "zustand";

export interface MarketAsset {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  lastUpdate: number;
}

export interface MarketDepth {
  bids: Array<[number, number]>; // [price, volume]
  asks: Array<[number, number]>; // [price, volume]
}

export interface TopMover {
  symbol: string;
  name: string;
  changePercent24h: number;
  price: number;
  volume24h: number;
}

export interface MarketState {
  // Assets data
  assets: MarketAsset[];
  filteredAssets: MarketAsset[];
  searchQuery: string;
  sortBy: 'symbol' | 'price' | 'change24h' | 'volume24h' | 'marketCap';
  sortOrder: 'asc' | 'desc';

  // Top movers
  topGainers: TopMover[];
  topLosers: TopMover[];

  // Watchlist
  watchlist: string[]; // Array of symbols
  watchlistAssets: MarketAsset[];

  // Market depth (for selected asset)
  marketDepth: MarketDepth | null;

  // Real-time updates
  isUpdating: boolean;
  lastUpdate: number;

  // Actions
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'symbol' | 'price' | 'change24h' | 'volume24h' | 'marketCap') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  toggleWatchlist: (symbol: string) => void;
  updateAssetPrices: () => void;
  initializeMarketData: () => void;
  getMarketDepth: (symbol: string) => void;
}

// Mock data generator
const generateMockAssets = (): MarketAsset[] => {
  const baseAssets = [
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', basePrice: 43250.75, marketCap: 850000000000 },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', basePrice: 2650.30, marketCap: 320000000000 },
    { symbol: 'BNB', name: 'Binance Coin', icon: '🟡', basePrice: 315.20, marketCap: 48000000000 },
    { symbol: 'ADA', name: 'Cardano', icon: '₳', basePrice: 0.52, marketCap: 18500000000 },
    { symbol: 'SOL', name: 'Solana', icon: '◎', basePrice: 98.45, marketCap: 45000000000 },
    { symbol: 'DOT', name: 'Polkadot', icon: '●', basePrice: 7.85, marketCap: 11000000000 },
    { symbol: 'DOGE', name: 'Dogecoin', icon: '🐕', basePrice: 0.085, marketCap: 12000000000 },
    { symbol: 'AVAX', name: 'Avalanche', icon: '🔺', basePrice: 38.90, marketCap: 15000000000 },
    { symbol: 'LTC', name: 'Litecoin', icon: 'Ł', basePrice: 72.15, marketCap: 5500000000 },
    { symbol: 'LINK', name: 'Chainlink', icon: '🔗', basePrice: 15.20, marketCap: 9200000000 },
    { symbol: 'UNI', name: 'Uniswap', icon: '🦄', basePrice: 6.85, marketCap: 5200000000 },
    { symbol: 'ALGO', name: 'Algorand', icon: '🔵', basePrice: 0.19, marketCap: 2500000000 },
    { symbol: 'VET', name: 'VeChain', icon: '⚡', basePrice: 0.031, marketCap: 2200000000 },
    { symbol: 'ICP', name: 'Internet Computer', icon: '💎', basePrice: 12.45, marketCap: 5800000000 },
    { symbol: 'FIL', name: 'Filecoin', icon: '📁', basePrice: 5.62, marketCap: 3200000000 },
  ];

  return baseAssets.map(asset => {
    const changePercent = (Math.random() - 0.5) * 20; // -10% to +10%
    const change24h = (asset.basePrice * changePercent) / 100;
    const currentPrice = asset.basePrice + change24h;
    const volume24h = Math.random() * 10000000000 + 1000000000; // 1B to 11B

    return {
      symbol: asset.symbol,
      name: asset.name,
      icon: asset.icon,
      price: currentPrice,
      change24h: change24h,
      changePercent24h: changePercent,
      volume24h: volume24h,
      marketCap: asset.marketCap,
      high24h: currentPrice * (1 + Math.random() * 0.05), // Up to 5% higher
      low24h: currentPrice * (1 - Math.random() * 0.05), // Up to 5% lower
      lastUpdate: Date.now(),
    };
  });
};

const generateMarketDepth = (basePrice: number): MarketDepth => {
  const bids: Array<[number, number]> = [];
  const asks: Array<[number, number]> = [];

  // Generate 10 bid levels
  for (let i = 1; i <= 10; i++) {
    const price = basePrice * (1 - i * 0.001); // 0.1% lower each level
    const volume = Math.random() * 100 + 10; // 10-110 units
    bids.push([price, volume]);
  }

  // Generate 10 ask levels
  for (let i = 1; i <= 10; i++) {
    const price = basePrice * (1 + i * 0.001); // 0.1% higher each level
    const volume = Math.random() * 100 + 10; // 10-110 units
    asks.push([price, volume]);
  }

  return { bids, asks };
};

export const useMarketStore = create<MarketState>((set, get) => ({
  assets: [],
  filteredAssets: [],
  searchQuery: '',
  sortBy: 'marketCap',
  sortOrder: 'desc',
  topGainers: [],
  topLosers: [],
  watchlist: ['BTC', 'ETH', 'SOL'],
  watchlistAssets: [],
  marketDepth: null,
  isUpdating: false,
  lastUpdate: Date.now(),

  setSearchQuery: (query) =>
    set((state) => {
      const filteredAssets = state.assets.filter(asset =>
        asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
        asset.name.toLowerCase().includes(query.toLowerCase())
      );
      return { searchQuery: query, filteredAssets };
    }),

  setSortBy: (sortBy) => set({ sortBy }),

  setSortOrder: (sortOrder) => set({ sortOrder }),

  addToWatchlist: (symbol) =>
    set((state) => {
      if (!state.watchlist.includes(symbol)) {
        const newWatchlist = [...state.watchlist, symbol];
        const watchlistAssets = state.assets.filter(asset =>
          newWatchlist.includes(asset.symbol)
        );
        return { watchlist: newWatchlist, watchlistAssets };
      }
      return state;
    }),

  removeFromWatchlist: (symbol) =>
    set((state) => {
      const newWatchlist = state.watchlist.filter(s => s !== symbol);
      const watchlistAssets = state.assets.filter(asset =>
        newWatchlist.includes(asset.symbol)
      );
      return { watchlist: newWatchlist, watchlistAssets };
    }),

  toggleWatchlist: (symbol) =>
    set((state) => {
      const isInWatchlist = state.watchlist.includes(symbol);
      const newWatchlist = isInWatchlist
        ? state.watchlist.filter(s => s !== symbol)
        : [...state.watchlist, symbol];
      const watchlistAssets = state.assets.filter(asset =>
        newWatchlist.includes(asset.symbol)
      );
      return { watchlist: newWatchlist, watchlistAssets };
    }),

  updateAssetPrices: () =>
    set((state) => {
      const updatedAssets = state.assets.map(asset => {
        // Simulate small price movements
        const volatility = 0.002; // 0.2% max change per update
        const change = (Math.random() - 0.5) * 2 * volatility;
        const newPrice = asset.price * (1 + change);
        const newChange24h = asset.change24h + (change * asset.price);
        const newChangePercent24h = (newChange24h / (newPrice - newChange24h)) * 100;

        return {
          ...asset,
          price: newPrice,
          change24h: newChange24h,
          changePercent24h: newChangePercent24h,
          volume24h: asset.volume24h + (Math.random() - 0.5) * 10000000, // Small volume changes
          high24h: Math.max(asset.high24h, newPrice),
          low24h: Math.min(asset.low24h, newPrice),
          lastUpdate: Date.now(),
        };
      });

      // Update filtered assets
      const filteredAssets = updatedAssets.filter(asset =>
        asset.symbol.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(state.searchQuery.toLowerCase())
      );

      // Sort and get top movers
      const sortedByChange = [...updatedAssets].sort((a, b) =>
        b.changePercent24h - a.changePercent24h
      );
      const topGainers = sortedByChange.slice(0, 5).map(asset => ({
        symbol: asset.symbol,
        name: asset.name,
        changePercent24h: asset.changePercent24h,
        price: asset.price,
        volume24h: asset.volume24h,
      }));
      const topLosers = sortedByChange.slice(-5).reverse().map(asset => ({
        symbol: asset.symbol,
        name: asset.name,
        changePercent24h: asset.changePercent24h,
        price: asset.price,
        volume24h: asset.volume24h,
      }));

      // Update watchlist assets
      const watchlistAssets = updatedAssets.filter(asset =>
        state.watchlist.includes(asset.symbol)
      );

      return {
        assets: updatedAssets,
        filteredAssets,
        topGainers,
        topLosers,
        watchlistAssets,
        lastUpdate: Date.now(),
      };
    }),

  initializeMarketData: () => {
    const assets = generateMockAssets();
    const filteredAssets = assets;
    const sortedByChange = [...assets].sort((a, b) =>
      b.changePercent24h - a.changePercent24h
    );
    const topGainers = sortedByChange.slice(0, 5).map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      changePercent24h: asset.changePercent24h,
      price: asset.price,
      volume24h: asset.volume24h,
    }));
    const topLosers = sortedByChange.slice(-5).reverse().map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      changePercent24h: asset.changePercent24h,
      price: asset.price,
      volume24h: asset.volume24h,
    }));
    const watchlistAssets = assets.filter(asset =>
      get().watchlist.includes(asset.symbol)
    );

    set({
      assets,
      filteredAssets,
      topGainers,
      topLosers,
      watchlistAssets,
      lastUpdate: Date.now(),
    });
  },

  getMarketDepth: (symbol) =>
    set((state) => {
      const asset = state.assets.find(a => a.symbol === symbol);
      if (!asset) return state;

      const marketDepth = generateMarketDepth(asset.price);
      return { marketDepth };
    }),
}));