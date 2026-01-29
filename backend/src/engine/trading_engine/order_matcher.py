class OrderMatcher:
    def __init__(self):
        self.orders = []

    def add_order(self, order):
        self.orders.append(order)
        self.match_orders()

    def match_orders(self):
        # Simple order matching logic
        buy_orders = [o for o in self.orders if o['type'] == 'buy']
        sell_orders = [o for o in self.orders if o['type'] == 'sell']

        for buy in buy_orders:
            for sell in sell_orders:
                if buy['symbol'] == sell['symbol'] and buy['price'] >= sell['price']:
                    # Match found
                    quantity = min(buy['quantity'], sell['quantity'])
                    print(f"Matched {quantity} shares of {buy['symbol']} at {sell['price']}")
                    # Remove matched orders or update quantities
                    break