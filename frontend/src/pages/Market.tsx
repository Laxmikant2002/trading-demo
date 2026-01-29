import React from "react";
import MarketOverview from "../components/market/MarketOverview";

const Market: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MarketOverview />
      </div>
    </div>
  );
};

export default Market;
