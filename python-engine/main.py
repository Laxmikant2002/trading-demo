#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.engine.trading_engine.order_matcher import OrderMatcher
from src.engine.market_data.data_fetcher import DataFetcher

def main():
    print("Starting XPro Trading Python Engine")

    # Initialize components
    order_matcher = OrderMatcher()
    data_fetcher = DataFetcher()

    # Example usage
    print("Engine started successfully")

if __name__ == "__main__":
    main()