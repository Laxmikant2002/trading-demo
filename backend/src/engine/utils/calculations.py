def calculate_percentage_change(old_value, new_value):
    if old_value == 0:
        return 0
    return ((new_value - old_value) / old_value) * 100

def calculate_moving_average(prices, window=20):
    if len(prices) < window:
        return sum(prices) / len(prices)
    return sum(prices[-window:]) / window

def calculate_volatility(returns):
    if not returns:
        return 0
    mean_return = sum(returns) / len(returns)
    variance = sum((r - mean_return) ** 2 for r in returns) / len(returns)
    return variance ** 0.5