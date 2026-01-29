import React, { useEffect } from "react";
import { useMarketStore } from "../../store/market.store";
import { useTradingStore } from "../../store/trading.store";

const MarketDepth: React.FC = () => {
  const { marketDepth, getMarketDepth } = useMarketStore();
  const { selectedAsset } = useTradingStore();

  useEffect(() => {
    if (selectedAsset?.symbol) {
      getMarketDepth(selectedAsset.symbol);
    }
  }, [selectedAsset?.symbol, getMarketDepth]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  const formatVolume = (volume: number) => {
    return volume.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (!marketDepth || !selectedAsset) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p>Select an asset to view market depth</p>
        </div>
      </div>
    );
  }

  const maxBidVolume = Math.max(
    ...marketDepth.bids.map(([, volume]) => volume),
  );
  const maxAskVolume = Math.max(
    ...marketDepth.asks.map(([, volume]) => volume),
  );
  const maxVolume = Math.max(maxBidVolume, maxAskVolume);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Market Depth - {selectedAsset.symbol}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Real-time order book for {selectedAsset.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 p-4">
        {/* Bids (Buy Orders) */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Bids (Buy)
          </h4>
          <div className="space-y-1">
            {marketDepth.bids.slice(0, 10).map(([price, volume], index) => (
              <div
                key={`bid-${index}`}
                className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-green-50 transition-colors"
              >
                <span className="font-medium text-green-600">
                  {formatPrice(price)}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900">{formatVolume(volume)}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(volume / maxVolume) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            Asks (Sell)
          </h4>
          <div className="space-y-1">
            {marketDepth.asks.slice(0, 10).map(([price, volume], index) => (
              <div
                key={`ask-${index}`}
                className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-red-50 transition-colors"
              >
                <span className="font-medium text-red-600">
                  {formatPrice(price)}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900">{formatVolume(volume)}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(volume / maxVolume) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spread Indicator */}
      <div className="px-4 pb-4">
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Spread: </span>
            {formatPrice(marketDepth.asks[0][0] - marketDepth.bids[0][0])}
            <span className="text-gray-500 ml-2">
              (
              {(
                ((marketDepth.asks[0][0] - marketDepth.bids[0][0]) /
                  marketDepth.bids[0][0]) *
                100
              ).toFixed(4)}
              %)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDepth;
