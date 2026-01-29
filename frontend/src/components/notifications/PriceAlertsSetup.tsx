import React, { useState } from "react";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { useNotificationStore } from "../../store/notification.store";

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
  isActive: boolean;
}

const PriceAlertsSetup: React.FC = () => {
  const { showPriceAlertsSetup, togglePriceAlertsSetup } =
    useNotificationStore();
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: "1",
      symbol: "AAPL",
      targetPrice: 150,
      condition: "above",
      isActive: true,
    },
    {
      id: "2",
      symbol: "TSLA",
      targetPrice: 200,
      condition: "below",
      isActive: false,
    },
  ]);
  const [newSymbol, setNewSymbol] = useState("");
  const [newTargetPrice, setNewTargetPrice] = useState("");
  const [newCondition, setNewCondition] = useState<"above" | "below">("above");

  if (!showPriceAlertsSetup) return null;

  const addAlert = () => {
    if (!newSymbol.trim() || !newTargetPrice.trim()) return;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newSymbol.toUpperCase(),
      targetPrice: parseFloat(newTargetPrice),
      condition: newCondition,
      isActive: true,
    };

    setAlerts([...alerts, newAlert]);
    setNewSymbol("");
    setNewTargetPrice("");
    setNewCondition("above");
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert,
      ),
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addAlert();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-25"
        onClick={togglePriceAlertsSetup}
      />

      <div className="absolute right-4 top-16 w-96 max-h-[32rem] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Price Alerts
            </h3>
          </div>
          <button
            onClick={togglePriceAlertsSetup}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Add New Alert */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Symbol (e.g., AAPL)"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Target Price"
                value={newTargetPrice}
                onChange={(e) => setNewTargetPrice(e.target.value)}
                onKeyPress={handleKeyPress}
                step="0.01"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={newCondition}
                onChange={(e) =>
                  setNewCondition(e.target.value as "above" | "below")
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="above">Alert when price goes above</option>
                <option value="below">Alert when price goes below</option>
              </select>
              <button
                onClick={addAlert}
                disabled={!newSymbol.trim() || !newTargetPrice.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <BellIcon className="mx-auto h-12 w-12" />
              </div>
              <p className="text-gray-500 text-sm">No price alerts set up</p>
              <p className="text-gray-400 text-xs mt-1">
                Add alerts to get notified when prices reach your targets
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-3 h-3 rounded-full ${alert.isActive ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">
                            {alert.symbol}
                          </span>
                          <span className="text-sm text-gray-500">
                            {alert.condition === "above" ? ">" : "<"} $
                            {alert.targetPrice.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {alert.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          alert.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {alert.isActive ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Price alerts will notify you when the conditions are met during
            market hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceAlertsSetup;
