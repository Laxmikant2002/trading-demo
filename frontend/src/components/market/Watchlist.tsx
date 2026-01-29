import React from "react";
import { useMarketStore } from "../../store/market.store";
import {
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/solid";

const Watchlist: React.FC = () => {
  const { watchlistAssets, removeFromWatchlist } = useMarketStore();

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return price.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return `$${price.toFixed(6)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    }
    return volume.toFixed(2);
  };

  if (watchlistAssets.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your Watchlist is Empty
          </h3>
          <p className="text-gray-500">
            Add assets to your watchlist by clicking the star icon next to any
            asset in the market list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
          Watchlist ({watchlistAssets.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {watchlistAssets.map((asset) => (
          <div
            key={asset.symbol}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{asset.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">
                    {asset.symbol}
                  </div>
                  <div className="text-sm text-gray-500">{asset.name}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatPrice(asset.price)}
                  </div>
                  <div
                    className={`text-sm font-medium flex items-center ${
                      asset.changePercent24h >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {asset.changePercent24h >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                    )}
                    {asset.changePercent24h >= 0 ? "+" : ""}
                    {asset.changePercent24h.toFixed(2)}%
                  </div>
                </div>

                <div className="text-right text-sm text-gray-500">
                  <div>Vol: {formatVolume(asset.volume24h)}</div>
                  <div className="text-xs">
                    24h High: {formatPrice(asset.high24h)}
                  </div>
                </div>

                <button
                  onClick={() => removeFromWatchlist(asset.symbol)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Remove from watchlist"
                >
                  <StarIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Price Range Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{formatPrice(asset.low24h)}</span>
                <span>24h Range</span>
                <span>{formatPrice(asset.high24h)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${((asset.price - asset.low24h) / (asset.high24h - asset.low24h)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
