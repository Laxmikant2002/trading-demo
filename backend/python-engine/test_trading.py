#!/usr/bin/env python3
"""
Trading Engine Test Script
Demonstrates order execution, P&L calculations, and risk management
"""

import time
import requests
from datetime import datetime

# Test data - simulated market prices
MARKET_DATA = {
    "BTC": [45000, 46000, 44000, 47000, 48000, 46000, 49000, 50000, 48000, 51000],
    "ETH": [3000, 3100, 2900, 3200, 3300, 3100, 3400, 3500, 3300, 3600],
    "SOL": [100, 105, 95, 110, 115, 105, 120, 125, 115, 130]
}

BASE_URL = "http://localhost:8000"

def test_trading_engine():
    """Test the trading engine with various scenarios"""

    print("🚀 Starting Trading Engine Tests")
    print("=" * 50)

    # Reset portfolio
    response = requests.post(f"{BASE_URL}/reset")
    print(f"Portfolio reset: {response.json()}")

    # Get initial portfolio
    response = requests.get(f"{BASE_URL}/portfolio")
    print(f"Initial portfolio: {response.json()}")
    print()

    # Test 1: Market Orders
    print("📈 Test 1: Market Orders")
    print("-" * 30)

    # Set initial prices
    for symbol, prices in MARKET_DATA.items():
        requests.post(f"{BASE_URL}/market-price/{symbol}", json=prices[0])

    # Place market orders
    orders = [
        {"symbol": "BTC", "type": "market", "side": "buy", "quantity": 0.1},
        {"symbol": "ETH", "type": "market", "side": "buy", "quantity": 1.0},
        {"symbol": "SOL", "type": "market", "side": "sell", "quantity": 10.0}
    ]

    for order in orders:
        response = requests.post(f"{BASE_URL}/orders", json=order)
        print(f"Placed order: {order}")
        print(f"Response: {response.json()}")
        print()

    # Test 2: Limit Orders
    print("🎯 Test 2: Limit Orders")
    print("-" * 30)

    limit_orders = [
        {"symbol": "BTC", "type": "limit", "side": "buy", "quantity": 0.05, "price": 44000},
        {"symbol": "ETH", "type": "limit", "side": "sell", "quantity": 0.5, "price": 3200}
    ]

    for order in limit_orders:
        response = requests.post(f"{BASE_URL}/orders", json=order)
        print(f"Placed limit order: {order}")
        print(f"Response: {response.json()}")
        print()

    # Test 3: Price Movements and Order Execution
    print("💹 Test 3: Price Movements & Order Execution")
    print("-" * 50)

    for i in range(1, len(MARKET_DATA["BTC"])):
        print(f"\n--- Price Update {i} ---")

        for symbol in MARKET_DATA.keys():
            price = MARKET_DATA[symbol][i]
            requests.post(f"{BASE_URL}/market-price/{symbol}", json=price)
            print(f"Updated {symbol} price: ${price}")

        # Check portfolio after price update
        response = requests.get(f"{BASE_URL}/portfolio")
        portfolio = response.json()
        print(f"Portfolio equity: ${portfolio['equity']:.2f}")
        print(f"Margin level: {portfolio['margin_level']:.2f}%")
        print()

        time.sleep(0.5)  # Small delay for demonstration

    # Test 4: Stop Loss and Take Profit
    print("🛡️ Test 4: Stop Loss & Take Profit Orders")
    print("-" * 40)

    # Add stop loss and take profit to existing positions
    stop_orders = [
        {"symbol": "BTC", "type": "stop_loss", "side": "sell", "quantity": 0.05, "stop_price": 47000},
        {"symbol": "ETH", "type": "take_profit", "side": "sell", "quantity": 0.5, "stop_price": 3500}
    ]

    for order in stop_orders:
        response = requests.post(f"{BASE_URL}/orders", json=order)
        print(f"Placed stop order: {order}")
        print(f"Response: {response.json()}")
        print()

    # Test 5: Risk Metrics
    print("📊 Test 5: Risk Metrics & Performance")
    print("-" * 40)

    response = requests.get(f"{BASE_URL}/risk-metrics")
    risk_metrics = response.json()
    print("Risk Metrics:")
    for key, value in risk_metrics.items():
        print(f"  {key}: {value:.4f}")

    response = requests.get(f"{BASE_URL}/performance")
    performance = response.json()
    print("\nPerformance Summary:")
    print(f"  Final Balance: ${performance['portfolio']['balance']:.2f}")
    print(f"  Total Equity: ${performance['portfolio']['equity']:.2f}")
    print(f"  Total Trades: {performance['trading_stats']['total_trades']}")
    print(f"  Net P&L: ${performance['trading_stats']['net_pnl']:.2f}")

    print("\n✅ All tests completed!")

if __name__ == "__main__":
    try:
        test_trading_engine()
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("Make sure the trading engine is running on http://localhost:8000")