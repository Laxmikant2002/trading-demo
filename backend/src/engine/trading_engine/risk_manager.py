class RiskManager:
    def __init__(self, max_loss_percent=0.1):
        self.max_loss_percent = max_loss_percent

    def check_risk(self, portfolio_value, current_loss):
        loss_percent = abs(current_loss) / portfolio_value
        return loss_percent <= self.max_loss_percent

    def calculate_var(self, returns, confidence=0.95):
        # Value at Risk calculation
        sorted_returns = sorted(returns)
        index = int((1 - confidence) * len(sorted_returns))
        return sorted_returns[index]