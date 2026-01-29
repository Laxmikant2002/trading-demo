import React, { useState, useEffect } from "react";
import { useTradingStore } from "../../store/trading.store";
import { Switch } from "@headlessui/react";

const OrderForm: React.FC = () => {
  const {
    selectedAsset,
    orderForm,
    balance,
    currentPrice,
    updateOrderForm,
    resetOrderForm,
  } = useTradingStore();

  const [calculatedValues, setCalculatedValues] = useState({
    total: 0,
    fee: 0,
    netTotal: 0,
  });

  // Calculate order values
  useEffect(() => {
    if (!selectedAsset || !orderForm.amount) {
      setCalculatedValues({ total: 0, fee: 0, netTotal: 0 });
      return;
    }

    const amount = parseFloat(orderForm.amount) || 0;
    const price =
      orderForm.type === "market"
        ? currentPrice
        : parseFloat(orderForm.price) || 0;
    const total = amount * price;
    const fee = total * 0.001; // 0.1% fee
    const netTotal = orderForm.side === "buy" ? total + fee : total - fee;

    setCalculatedValues({ total, fee, netTotal });
  }, [
    orderForm.amount,
    orderForm.price,
    orderForm.type,
    currentPrice,
    selectedAsset,
    orderForm.side,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement order submission
    console.log("Order submitted:", orderForm, calculatedValues);
    resetOrderForm();
  };

  const isInsufficientFunds =
    orderForm.side === "buy" && calculatedValues.netTotal > balance.available;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Place Order</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Type Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Order Type</span>
          <div className="flex items-center space-x-3">
            <span
              className={`text-sm ${orderForm.type === "market" ? "text-blue-600 font-medium" : "text-gray-500"}`}
            >
              Market
            </span>
            <Switch
              checked={orderForm.type === "limit"}
              onChange={(checked) =>
                updateOrderForm({ type: checked ? "limit" : "market" })
              }
              className={`${
                orderForm.type === "limit" ? "bg-blue-600" : "bg-gray-200"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  orderForm.type === "limit" ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
            <span
              className={`text-sm ${orderForm.type === "limit" ? "text-blue-600 font-medium" : "text-gray-500"}`}
            >
              Limit
            </span>
          </div>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1">
          <button
            type="button"
            onClick={() => updateOrderForm({ side: "buy" })}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              orderForm.side === "buy"
                ? "bg-green-500 text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => updateOrderForm({ side: "sell" })}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              orderForm.side === "sell"
                ? "bg-red-500 text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Sell
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount ({selectedAsset?.symbol})
          </label>
          <input
            type="number"
            step="0.00000001"
            min="0"
            value={orderForm.amount}
            onChange={(e) => updateOrderForm({ amount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        {/* Price Input (only for limit orders) */}
        {orderForm.type === "limit" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={orderForm.price}
              onChange={(e) => updateOrderForm({ price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={currentPrice.toString()}
            />
          </div>
        )}

        {/* Stop Loss & Take Profit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stop Loss (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={orderForm.stopLoss}
              onChange={(e) => updateOrderForm({ stopLoss: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Take Profit (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={orderForm.takeProfit}
              onChange={(e) => updateOrderForm({ takeProfit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-gray-900">Order Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium">
                $
                {orderForm.type === "market"
                  ? currentPrice.toLocaleString()
                  : (parseFloat(orderForm.price) || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">
                {orderForm.amount || "0"} {selectedAsset?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">
                ${calculatedValues.total.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fee (0.1%):</span>
              <span className="font-medium">
                ${calculatedValues.fee.toLocaleString()}
              </span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900">
                {orderForm.side === "buy" ? "Total Cost:" : "Total Received:"}
              </span>
              <span
                className={
                  orderForm.side === "buy" ? "text-red-600" : "text-green-600"
                }
              >
                ${calculatedValues.netTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Insufficient Funds Warning */}
        {isInsufficientFunds && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="text-sm text-red-700">
                Insufficient funds. Available: $
                {balance.available.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!orderForm.amount || isInsufficientFunds}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            orderForm.side === "buy"
              ? "bg-green-500 hover:bg-green-600 disabled:bg-gray-300"
              : "bg-red-500 hover:bg-red-600 disabled:bg-gray-300"
          } disabled:cursor-not-allowed`}
        >
          {orderForm.side === "buy" ? "Buy" : "Sell"} {selectedAsset?.symbol}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
