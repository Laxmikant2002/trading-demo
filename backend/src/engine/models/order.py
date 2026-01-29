class Order:
    def __init__(self, user_id, symbol, order_type, quantity, price):
        self.user_id = user_id
        self.symbol = symbol
        self.type = order_type
        self.quantity = quantity
        self.price = price
        self.status = 'pending'

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'symbol': self.symbol,
            'type': self.type,
            'quantity': self.quantity,
            'price': self.price,
            'status': self.status
        }