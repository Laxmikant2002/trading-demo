import React, { useEffect, useState } from "react";
import { useTradingStore } from "../../store/trading.store";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

const PriceTicker: React.FC = () => {
  const { selectedAsset, currentPrice, priceChange } = useTradingStore();
  const [previousPrice, setPreviousPrice] = useState(currentPrice);
  const [isPriceUp, setIsPriceUp] = useState(true);

  useEffect(() => {
    setIsPriceUp(currentPrice >= previousPrice);
    setPreviousPrice(currentPrice);
  }, [currentPrice, previousPrice]);

  if (!selectedAsset) return null;

  const priceColor = priceChange >= 0 ? "text-green-600" : "text-red-600";
  const changeIcon = priceChange >= 0 ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{selectedAsset.icon}</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedAsset.symbol}/USD
            </h2>
            <p className="text-sm text-gray-500">{selectedAsset.name}</p>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`text-3xl font-bold ${isPriceUp ? "text-green-600" : "text-red-600"} transition-colors duration-300`}
          >
            $
            {currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div
            className={`flex items-center justify-end space-x-1 text-lg ${priceColor}`}
          >
            {React.createElement(changeIcon, { className: "h-5 w-5" })}
            <span className="font-medium">
              {priceChange >= 0 ? "+" : ""}
              {priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Additional market data */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">24h High</span>
          <div className="font-semibold text-gray-900">
            $
            {(currentPrice * 1.05).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div>
          <span className="text-gray-500">24h Low</span>
          <div className="font-semibold text-gray-900">
            $
            {(currentPrice * 0.95).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div>
          <span className="text-gray-500">24h Volume</span>
          <div className="font-semibold text-gray-900">
            ${(selectedAsset.volume24h / 1000000).toFixed(0)}M
          </div>
        </div>
        <div>
          <span className="text-gray-500">Market Cap</span>
          <div className="font-semibold text-gray-900">
            ${((currentPrice * 21000000) / 1000000).toFixed(0)}M
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTicker;
