import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import UserMenu from "./UserMenu";
import Notifications from "./Notifications";

const Header: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-blue-600">
              XPro Trading
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/trading"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Trading
            </Link>
            <Link
              to="/market"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Market
            </Link>
            <Link
              to="/portfolio"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Portfolio
            </Link>
            <Link
              to="/history"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              History
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Notifications />
                <UserMenu />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
