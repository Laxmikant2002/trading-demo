import React from "react";

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">XPro Trading</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience professional-grade trading with our advanced platform.
            Trade cryptocurrencies with real-time data, advanced charting, and
            risk management tools.
          </p>
          <div className="space-x-4">
            <a
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Real-Time Trading</h3>
            <p className="text-gray-600">
              Execute trades with real-time market data and advanced order
              types.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
            <p className="text-gray-600">
              Comprehensive portfolio tracking with performance metrics and risk
              analysis.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Demo Trading</h3>
            <p className="text-gray-600">
              Practice with $10,000 demo balance before trading with real money.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
