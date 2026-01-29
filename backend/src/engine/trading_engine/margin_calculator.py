class MarginCalculator:
    def calculate_margin_requirement(self, order_value, leverage=1):
        return order_value / leverage

    def check_margin(self, portfolio_value, margin_used, new_order_value):
        available_margin = portfolio_value - margin_used
        return available_margin >= new_order_value