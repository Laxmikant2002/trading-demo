import React, { useState, useRef, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";
import {
  ChevronDownIcon,
  Cog6ToothIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { useNotificationStore } from "../../store/notification.store";

interface NotificationBellProps {
  onClick?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
  const { unreadCount, toggleNotificationCenter, togglePriceAlertsSetup } =
    useNotificationStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    toggleNotificationCenter();
    setIsDropdownOpen(false);
    onClick?.();
  };

  const handlePriceAlertsClick = () => {
    togglePriceAlertsSetup();
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex items-center space-x-1"
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="h-6 w-6" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={handleBellClick}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
            >
              <BellIcon className="h-5 w-5" />
              <div>
                <div className="font-medium">Notifications</div>
                {unreadCount > 0 && (
                  <div className="text-xs text-gray-500">
                    {unreadCount} unread
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={handlePriceAlertsClick}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
            >
              <BellAlertIcon className="h-5 w-5" />
              <div>
                <div className="font-medium">Price Alerts</div>
                <div className="text-xs text-gray-500">
                  Set up price notifications
                </div>
              </div>
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={() => setIsDropdownOpen(false)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
            >
              <Cog6ToothIcon className="h-5 w-5" />
              <div>
                <div className="font-medium">Settings</div>
                <div className="text-xs text-gray-500">
                  Notification preferences
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
