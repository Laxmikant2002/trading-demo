class PnLCalculator:
    def calculate_pnl(self, portfolio, current_prices):
        total_pnl = 0
        for holding in portfolio.get('holdings', []):
            symbol = holding['symbol']
            quantity = holding['quantity']
            avg_price = holding['averagePrice']
            current_price = current_prices.get(symbol, avg_price)
            pnl = (current_price - avg_price) * quantity
            total_pnl += pnl
        return total_pnl