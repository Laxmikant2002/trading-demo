import React from "react";
import { useTradingStore } from "../../store/trading.store";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

const BalanceDisplay: React.FC = () => {
  const { balance, orderForm, currentPrice, selectedAsset } = useTradingStore();

  const calculateRequiredAmount = () => {
    if (!orderForm.amount || orderForm.side === "sell") return 0;
    const amount = parseFloat(orderForm.amount) || 0;
    const price =
      orderForm.type === "market"
        ? currentPrice
        : parseFloat(orderForm.price) || 0;
    const total = amount * price;
    const fee = total * 0.001; // 0.1% fee
    return total + fee;
  };

  const requiredAmount = calculateRequiredAmount();
  const isInsufficientFunds =
    orderForm.side === "buy" && requiredAmount > balance.available;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Account Balance
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Available Balance</span>
          <span className="font-semibold text-gray-900">
            $
            {balance.available.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Balance</span>
          <span className="font-semibold text-gray-900">
            $
            {balance.total.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {selectedAsset && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Buying Power ({selectedAsset.symbol})
            </span>
            <span className="font-semibold text-gray-900">
              {(balance.available / currentPrice).toFixed(8)}{" "}
              {selectedAsset.symbol}
            </span>
          </div>
        )}

        {isInsufficientFunds && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <div className="text-sm">
                <div className="font-medium text-red-800">
                  Insufficient Funds
                </div>
                <div className="text-red-700">
                  Required: $
                  {requiredAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  <br />
                  Available: $
                  {balance.available.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  <br />
                  Shortfall: $
                  {(requiredAmount - balance.available).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick deposit button */}
        <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
          Deposit Funds
        </button>
      </div>
    </div>
  );
};

export default BalanceDisplay;
