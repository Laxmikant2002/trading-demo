import React from "react";
import AssetSelector from "../components/trading/AssetSelector";
import OrderForm from "../components/trading/OrderForm";
import PriceTicker from "../components/trading/PriceTicker";
import BalanceDisplay from "../components/trading/BalanceDisplay";
import QuickTradeButtons from "../components/trading/QuickTradeButtons";
import TradingChart from "../components/trading/TradingChart";

const Trading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trading</h1>
          <p className="mt-2 text-gray-600">
            Buy and sell cryptocurrencies with advanced trading tools
          </p>
        </div>

        {/* Trading Chart */}
        <div className="mb-8">
          <TradingChart height={500} />
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Asset Selection & Price Ticker */}
          <div className="lg:col-span-4 space-y-6">
            <AssetSelector />
            <PriceTicker />
          </div>

          {/* Middle Column - Order Form */}
          <div className="lg:col-span-5">
            <OrderForm />
          </div>

          {/* Right Column - Balance & Quick Trade */}
          <div className="lg:col-span-3 space-y-6">
            <BalanceDisplay />
            <QuickTradeButtons />
          </div>
        </div>

        {/* Mobile Layout Adjustments */}
        <div className="lg:hidden mt-6 space-y-6">
          {/* On mobile, show balance and quick trade below */}
          <BalanceDisplay />
          <QuickTradeButtons />
        </div>

        {/* Trading Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Trading Tips
          </h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>
              • Market orders execute immediately at the current market price
            </li>
            <li>• Limit orders allow you to set a specific price target</li>
            <li>
              • Stop-loss orders help protect your profits by automatically
              selling when price drops
            </li>
            <li>
              • Take-profit orders automatically sell when your target price is
              reached
            </li>
            <li>• All orders include a 0.1% trading fee</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Trading;
