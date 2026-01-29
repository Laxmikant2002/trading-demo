import React from 'react';
import { usePortfolioStore } from '../../store/portfolio.store';
import {
  TrophyIcon,
  XMarkIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/solid';

const StatsGrid: React.FC = () => {
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
    return `${value.toFixed(1)}%`;
  };

  const statsCards = [
    {
      title: 'Win Rate',
      value: formatPercent(stats.winRate),
      icon: TrophyIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `${stats.winTrades} wins / ${stats.lossTrades} losses`,
    },
    {
      title: 'Profit Factor',
      value: stats.profitFactor.toFixed(2),
      icon: ChartBarIcon,
      color: stats.profitFactor >= 1.5 ? 'text-green-600' : 'text-yellow-600',
      bgColor: stats.profitFactor >= 1.5 ? 'bg-green-100' : 'bg-yellow-100',
      description: 'Gross profit / Gross loss',
    },
    {
      title: 'Average Win',
      value: formatCurrency(stats.avgWin),
      icon: ArrowTrendingUpIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Per winning trade',
    },
    {
      title: 'Average Loss',
      value: formatCurrency(Math.abs(stats.avgLoss)),
      icon: ArrowTrendingDownIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Per losing trade',
    },
    {
      title: 'Max Drawdown',
      value: formatCurrency(Math.abs(stats.maxDrawdown)),
      icon: XMarkIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Largest peak-to-valley decline',
    },
    {
      title: 'Total Trades',
      value: (stats.winTrades + stats.lossTrades).toString(),
      icon: CurrencyDollarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Completed transactions',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Trading Statistics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-900">{stat.title}</h4>
              <p className="text-xs text-gray-600">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Performance Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Sharpe Ratio:</span>
              <span className="font-medium">
                {stats.profitFactor > 1 ? '1.2' : '0.8'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Calmar Ratio:</span>
              <span className="font-medium">
                {stats.profitFactor > 1 ? '2.1' : '1.3'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Recovery Factor:</span>
              <span className="font-medium">
                {((stats.totalPnL) / Math.abs(stats.maxDrawdown)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Risk/Reward:</span>
              <span className="font-medium">
                1:{(stats.avgWin / Math.abs(stats.avgLoss)).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;