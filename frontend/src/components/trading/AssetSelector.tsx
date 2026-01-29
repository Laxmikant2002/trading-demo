import React from "react";
import { useTradingStore } from "../../store/trading.store";
import { CheckIcon } from "@heroicons/react/24/solid";

const AssetSelector: React.FC = () => {
  const { assets, selectedAsset, setSelectedAsset } = useTradingStore();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Asset</h3>
      <div className="grid grid-cols-1 gap-3">
        {assets.map((asset) => (
          <button
            key={asset.symbol}
            onClick={() => setSelectedAsset(asset)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedAsset?.symbol === asset.symbol
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{asset.icon}</div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {asset.symbol}
                  </div>
                  <div className="text-sm text-gray-500">{asset.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  ${asset.price.toLocaleString()}
                </div>
                <div
                  className={`text-sm flex items-center ${
                    asset.change24h >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {asset.change24h >= 0 ? "+" : ""}
                  {asset.change24h.toFixed(2)}%
                </div>
              </div>
              {selectedAsset?.symbol === asset.symbol && (
                <CheckIcon className="h-5 w-5 text-blue-500" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AssetSelector;
