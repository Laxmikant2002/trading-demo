class HistoricalManager:
    def __init__(self):
        self.data = {}

    def store_data(self, symbol, data):
        self.data[symbol] = data

    def get_data(self, symbol, start_date, end_date):
        # Placeholder for retrieving historical data
        return self.data.get(symbol, [])

    def calculate_returns(self, symbol):
        prices = [d['price'] for d in self.data.get(symbol, [])]
        if len(prices) < 2:
            return []
        returns = []
        for i in range(1, len(prices)):
            ret = (prices[i] - prices[i-1]) / prices[i-1]
            returns.append(ret)
        return returns