import React from "react";
import { useTradingStore } from "../../store/trading.store";

const QuickTradeButtons: React.FC = () => {
  const { selectedAsset, currentPrice, balance, updateOrderForm } =
    useTradingStore();

  const quickAmounts = [0.01, 0.1, 1, 10]; // BTC amounts
  const quickPercentages = [25, 50, 75, 100]; // Percentage of balance

  const handleQuickAmount = (amount: number) => {
    updateOrderForm({
      amount: amount.toString(),
      side: "buy",
      type: "market",
    });
  };

  const handleQuickPercentage = (percentage: number) => {
    const maxAmount = balance.available / currentPrice;
    const amount = (maxAmount * percentage) / 100;
    updateOrderForm({
      amount: amount.toFixed(8),
      side: "buy",
      type: "market",
    });
  };

  if (!selectedAsset) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Trade</h3>

      {/* Quick Amount Buttons */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Quick Amounts
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickAmount(amount)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-3 rounded-md transition-colors text-sm"
            >
              {amount} {selectedAsset.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Percentage Buttons */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Percentage of Balance
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {quickPercentages.map((percentage) => (
            <button
              key={percentage}
              onClick={() => handleQuickPercentage(percentage)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-medium py-2 px-3 rounded-md transition-colors text-sm"
            >
              {percentage}%
            </button>
          ))}
        </div>
      </div>

      {/* One-Click Buy/Sell */}
      <div className="space-y-2">
        <button
          onClick={() => updateOrderForm({ side: "buy", type: "market" })}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-md transition-colors text-lg"
        >
          Quick Buy
        </button>
        <button
          onClick={() => updateOrderForm({ side: "sell", type: "market" })}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-md transition-colors text-lg"
        >
          Quick Sell
        </button>
      </div>

      {/* Current Selection Display */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <div className="text-sm text-gray-600">Current Selection:</div>
        <div className="font-medium text-gray-900">
          {selectedAsset.icon} {selectedAsset.symbol} @ $
          {currentPrice.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default QuickTradeButtons;
