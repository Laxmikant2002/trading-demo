import React from "react";
import { useMarketStore } from "../../store/market.store";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

const TopMovers: React.FC = () => {
  const { topGainers, topLosers } = useMarketStore();

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

  const MoverCard = ({
    title,
    movers,
    isGainer,
  }: {
    title: string;
    movers: typeof topGainers;
    isGainer: boolean;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        {isGainer ? (
          <ArrowUpIcon className="h-5 w-5 text-green-600 mr-2" />
        ) : (
          <ArrowDownIcon className="h-5 w-5 text-red-600 mr-2" />
        )}
        {title}
      </h3>

      <div className="space-y-3">
        {movers.map((mover, index) => (
          <div
            key={mover.symbol}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-sm font-medium text-gray-700">
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-gray-900">{mover.symbol}</div>
                <div className="text-sm text-gray-500">{mover.name}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-medium text-gray-900">
                {formatPrice(mover.price)}
              </div>
              <div
                className={`text-sm font-medium ${
                  isGainer ? "text-green-600" : "text-red-600"
                }`}
              >
                {mover.changePercent24h >= 0 ? "+" : ""}
                {mover.changePercent24h.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">
                Vol: {formatVolume(mover.volume24h)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MoverCard title="Top Gainers" movers={topGainers} isGainer={true} />
      <MoverCard title="Top Losers" movers={topLosers} isGainer={false} />
    </div>
  );
};

export default TopMovers;
