import random

class PriceSimulator:
    def __init__(self, initial_price=100.0, volatility=0.02):
        self.price = initial_price
        self.volatility = volatility

    def simulate_price(self):
        change = random.gauss(0, self.volatility)
        self.price *= (1 + change)
        return self.price

    def reset(self, price=100.0):
        self.price = price