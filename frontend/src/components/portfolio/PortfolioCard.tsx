import React from 'react';
import { usePortfolioStore } from '../../store/portfolio.store';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const PortfolioCard: React.FC = () => {
  const { stats } = usePortfolioStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getMarginLevelColor = (level: number) => {
    if (level >= 200) return 'text-green-600';
    if (level >= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMarginLevelBg = (level: number) => {
    if (level >= 200) return 'bg-green-100';
    if (level >= 100) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Portfolio Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Total Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalBalance)}
          </p>
          <p className="text-xs text-gray-500">
            Available: {formatCurrency(stats.availableBalance)}
          </p>
        </div>

        {/* Unrealized P&L */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Unrealized P&L</p>
          <div className="flex items-center space-x-2">
            <p className={`text-2xl font-bold ${
              stats.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(stats.unrealizedPnL)}
            </p>
            {stats.unrealizedPnL >= 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
            )}
          </div>
          <p className={`text-xs ${
            stats.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercent((stats.unrealizedPnL / (stats.totalBalance - stats.unrealizedPnL)) * 100)}
          </p>
        </div>

        {/* Realized P&L */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Realized P&L</p>
          <div className="flex items-center space-x-2">
            <p className={`text-2xl font-bold ${
              stats.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(stats.realizedPnL)}
            </p>
            {stats.realizedPnL >= 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
            )}
          </div>
          <p className="text-xs text-gray-500">
            Total P&L: {formatCurrency(stats.totalPnL)}
          </p>
        </div>

        {/* Margin Level */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Margin Level</p>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMarginLevelBg(stats.marginLevel)} ${getMarginLevelColor(stats.marginLevel)}`}>
            {stats.marginLevel >= 100 ? (
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            )}
            {stats.marginLevel.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-500">
            Used: {formatCurrency(stats.marginUsed)}
          </p>
        </div>
      </div>

      {/* Margin Warning */}
      {stats.marginLevel < 100 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-sm">
              <div className="font-medium text-red-800">Margin Call Warning</div>
              <div className="text-red-700">
                Your margin level is below 100%. Consider reducing positions or adding funds.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCard;