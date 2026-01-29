class UserAccount:
    def __init__(self, user_id, email):
        self.user_id = user_id
        self.email = email
        self.balance = 0.0
        self.margin_used = 0.0

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if self.balance >= amount:
            self.balance -= amount
            return True
        return False

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'email': self.email,
            'balance': self.balance,
            'margin_used': self.margin_used
        }