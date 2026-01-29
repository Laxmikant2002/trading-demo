import React from "react";
import { useMarketStore } from "../../store/market.store";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

const VolumeIndicators: React.FC = () => {
  const { assets } = useMarketStore();

  // Calculate volume metrics
  const totalVolume = assets.reduce((sum, asset) => sum + asset.volume24h, 0);
  const avgVolume = totalVolume / assets.length;

  // Get top volume assets
  const topVolumeAssets = [...assets]
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 5);

  // Calculate volume distribution
  const volumeRanges = {
    high: assets.filter((asset) => asset.volume24h > avgVolume * 1.5).length,
    medium: assets.filter(
      (asset) =>
        asset.volume24h >= avgVolume * 0.5 &&
        asset.volume24h <= avgVolume * 1.5,
    ).length,
    low: assets.filter((asset) => asset.volume24h < avgVolume * 0.5).length,
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Volume Indicators
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Volume Summary */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            24h Volume Summary
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Volume:</span>
              <span className="font-medium text-gray-900">
                ${formatVolume(totalVolume)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Volume:</span>
              <span className="font-medium text-gray-900">
                ${formatVolume(avgVolume)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Assets Tracked:</span>
              <span className="font-medium text-gray-900">{assets.length}</span>
            </div>
          </div>
        </div>

        {/* Volume Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Volume Distribution
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">High Volume</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {volumeRanges.high} assets
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Medium Volume</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {volumeRanges.medium} assets
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Low Volume</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {volumeRanges.low} assets
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Volume Assets */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Top Volume Assets
        </h4>
        <div className="space-y-2">
          {topVolumeAssets.map((asset, index) => (
            <div
              key={asset.symbol}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {index + 1}
                </div>
                <span className="text-lg">{asset.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">
                    {asset.symbol}
                  </div>
                  <div className="text-sm text-gray-500">{asset.name}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {formatPrice(asset.price)}
                </div>
                <div className="text-sm text-gray-600">
                  Vol: ${formatVolume(asset.volume24h)}
                </div>
                <div
                  className={`text-xs font-medium flex items-center justify-end ${
                    asset.changePercent24h >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {asset.changePercent24h >= 0 ? (
                    <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                  )}
                  {asset.changePercent24h >= 0 ? "+" : ""}
                  {asset.changePercent24h.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VolumeIndicators;
