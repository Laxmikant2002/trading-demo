import React, { useEffect } from "react";
import { useMarketStore } from "../../store/market.store";
import AssetList from "./AssetList";
import TopMovers from "./TopMovers";
import Watchlist from "./Watchlist";
import MarketDepth from "./MarketDepth";
import VolumeIndicators from "./VolumeIndicators";
import { useTradingStore } from "../../store/trading.store";

const MarketOverview: React.FC = () => {
  const { initializeMarketData, updateAssetPrices, isUpdating, lastUpdate } =
    useMarketStore();

  const { setSelectedAsset } = useTradingStore();

  useEffect(() => {
    // Initialize market data
    initializeMarketData();

    // Set up real-time updates every 2 seconds
    const interval = setInterval(() => {
      updateAssetPrices();
    }, 2000);

    return () => clearInterval(interval);
  }, [initializeMarketData, updateAssetPrices]);

  const handleAssetSelect = (symbol: string) => {
    const { assets } = useMarketStore.getState();
    const asset = assets.find((a) => a.symbol === symbol);
    if (asset) {
      setSelectedAsset(asset);
    }
  };

  const formatLastUpdate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ago`;
    } else {
      return `${Math.floor(seconds / 3600)}h ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with real-time status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Market Overview</h2>
          <p className="text-gray-600 mt-1">
            Real-time cryptocurrency market data and analysis
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${isUpdating ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
            ></div>
            <span className="text-sm text-gray-600">
              {isUpdating ? "Live" : "Updating..."}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Last update: {formatLastUpdate(lastUpdate)}
          </div>
        </div>
      </div>

      {/* Top Movers */}
      <TopMovers />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Asset List */}
        <div className="lg:col-span-2">
          <AssetList
            onAssetSelect={handleAssetSelect}
            selectedAsset={useTradingStore.getState().selectedAsset?.symbol}
          />
        </div>

        {/* Right Column - Watchlist */}
        <div>
          <Watchlist />
        </div>
      </div>

      {/* Market Depth and Volume Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketDepth />
        <VolumeIndicators />
      </div>
    </div>
  );
};

export default MarketOverview;
