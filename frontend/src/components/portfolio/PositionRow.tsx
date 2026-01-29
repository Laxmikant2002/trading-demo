import React from "react";
import { Position } from "../../store/portfolio.store";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/solid";

interface PositionRowProps {
  position: Position;
  onClose?: (positionId: string) => void;
}

const PositionRow: React.FC<PositionRowProps> = ({ position, onClose }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <tr className="hover:bg-gray-50">
      {/* Symbol */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="text-lg font-medium text-gray-900">
            {position.symbol}
          </div>
          <div
            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              position.side === "long"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {position.side.toUpperCase()}
          </div>
        </div>
      </td>

      {/* Quantity */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {position.quantity.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 8,
        })}
      </td>

      {/* Entry Price */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(position.entryPrice)}
      </td>

      {/* Current Price */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(position.currentPrice)}
      </td>

      {/* Market Value */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(position.marketValue)}
      </td>

      {/* Unrealized P&L */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span
            className={`text-sm font-medium ${
              position.unrealizedPnL >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(position.unrealizedPnL)}
          </span>
          {position.unrealizedPnL >= 0 ? (
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 ml-1" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 ml-1" />
          )}
        </div>
        <div
          className={`text-xs ${
            position.unrealizedPnLPercent >= 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {formatPercent(position.unrealizedPnLPercent)}
        </div>
      </td>

      {/* Entry Time */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(position.entryTime)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {onClose && (
          <button
            onClick={() => onClose(position.id)}
            className="text-red-600 hover:text-red-900 transition-colors"
          >
            Close
          </button>
        )}
      </td>
    </tr>
  );
};

export default PositionRow;
