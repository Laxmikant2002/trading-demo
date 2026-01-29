import React, { useEffect, useState } from 'react';
import { useMarketStore } from '../../store/market.store';
import { MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface AssetListProps {
  onAssetSelect?: (symbol: string) => void;
  selectedAsset?: string;
}

const AssetList: React.FC<AssetListProps> = ({ onAssetSelect, selectedAsset }) => {
  const {
    filteredAssets,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    toggleWatchlist,
    watchlist,
  } = useMarketStore();

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    // Debounce the search
    const timeoutId = setTimeout(() => {
      setSearchQuery(query);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return `$${price.toFixed(6)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(2)}K`;
    }
    return `$${marketCap.toFixed(2)}`;
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ?
      <ArrowUpIcon className="h-4 w-4" /> :
      <ArrowDownIcon className="h-4 w-4" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Assets</h3>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
        <div className="col-span-1"></div>
        <div
          className="col-span-2 cursor-pointer hover:text-gray-900 flex items-center space-x-1"
          onClick={() => handleSort('symbol')}
        >
          <span>Asset</span>
          {getSortIcon('symbol')}
        </div>
        <div
          className="col-span-2 cursor-pointer hover:text-gray-900 flex items-center space-x-1 justify-end"
          onClick={() => handleSort('price')}
        >
          <span>Price</span>
          {getSortIcon('price')}
        </div>
        <div
          className="col-span-2 cursor-pointer hover:text-gray-900 flex items-center space-x-1 justify-end"
          onClick={() => handleSort('change24h')}
        >
          <span>24h Change</span>
          {getSortIcon('change24h')}
        </div>
        <div
          className="col-span-3 cursor-pointer hover:text-gray-900 flex items-center space-x-1 justify-end"
          onClick={() => handleSort('volume24h')}
        >
          <span>Volume</span>
          {getSortIcon('volume24h')}
        </div>
        <div
          className="col-span-2 cursor-pointer hover:text-gray-900 flex items-center space-x-1 justify-end"
          onClick={() => handleSort('marketCap')}
        >
          <span>Market Cap</span>
          {getSortIcon('marketCap')}
        </div>
      </div>

      {/* Table Body */}
      <div className="max-h-96 overflow-y-auto">
        {filteredAssets.map((asset) => (
          <div
            key={asset.symbol}
            className={`grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedAsset === asset.symbol ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => onAssetSelect?.(asset.symbol)}
          >
            {/* Watchlist Star */}
            <div className="col-span-1 flex items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(asset.symbol);
                }}
                className="text-gray-400 hover:text-yellow-500 transition-colors"
              >
                {watchlist.includes(asset.symbol) ? (
                  <StarIconSolid className="h-5 w-5 text-yellow-500" />
                ) : (
                  <StarIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Asset Info */}
            <div className="col-span-2 flex items-center space-x-2">
              <span className="text-lg">{asset.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{asset.symbol}</div>
                <div className="text-xs text-gray-500">{asset.name}</div>
              </div>
            </div>

            {/* Price */}
            <div className="col-span-2 flex items-center justify-end">
              <span className="font-medium text-gray-900">
                {formatPrice(asset.price)}
              </span>
            </div>

            {/* 24h Change */}
            <div className="col-span-2 flex items-center justify-end">
              <span className={`font-medium ${
                asset.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
              </span>
            </div>

            {/* Volume */}
            <div className="col-span-3 flex items-center justify-end">
              <span className="text-gray-900">
                {formatVolume(asset.volume24h)}
              </span>
            </div>

            {/* Market Cap */}
            <div className="col-span-2 flex items-center justify-end">
              <span className="text-gray-900">
                {formatMarketCap(asset.marketCap)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No assets found matching your search.
        </div>
      )}
    </div>
  );
};

export default AssetList;