class Portfolio:
    def __init__(self, user_id):
        self.user_id = user_id
        self.holdings = []
        self.cash = 10000.0

    def add_holding(self, symbol, quantity, price):
        for holding in self.holdings:
            if holding['symbol'] == symbol:
                total_quantity = holding['quantity'] + quantity
                total_cost = (holding['quantity'] * holding['averagePrice']) + (quantity * price)
                holding['averagePrice'] = total_cost / total_quantity
                holding['quantity'] = total_quantity
                return
        self.holdings.append({
            'symbol': symbol,
            'quantity': quantity,
            'averagePrice': price
        })

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'holdings': self.holdings,
            'cash': self.cash
        }