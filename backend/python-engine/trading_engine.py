import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from models import (
    Order, OrderType, OrderSide, OrderStatus, Position, Trade,
    Portfolio, RiskMetrics, OrderRequest
)
from config import COMMISSION_RATE, MARGIN_CALL_LEVEL

class TradingEngine:
    def __init__(self, initial_balance: float = 10000.0, leverage: float = 1.0):
        self.portfolio = Portfolio(
            balance=initial_balance,
            equity=initial_balance,
            used_margin=0.0,
            margin_level=100.0,
            leverage=leverage
        )
        self.market_prices: Dict[str, float] = {}
        self.commission_rate = COMMISSION_RATE

    def update_market_price(self, symbol: str, price: float):
        """Update market price and check for order triggers"""
        self.market_prices[symbol] = price

        # Check stop-loss and take-profit triggers
        self._check_position_triggers(symbol, price)

        # Check pending limit orders
        self._check_limit_orders(symbol, price)

        # Update portfolio equity
        self._update_portfolio_equity()

    def place_order(self, order_request: OrderRequest) -> Order:
        """Place a new order"""
        order_id = f"order_{len(self.portfolio.orders) + 1}_{datetime.now().timestamp()}"

        order = Order(
            id=order_id,
            symbol=order_request.symbol,
            type=order_request.type,
            side=order_request.side,
            quantity=order_request.quantity,
            price=order_request.price,
            stop_price=order_request.stop_price,
            timestamp=datetime.now()
        )

        # Execute market orders immediately
        if order.type == OrderType.MARKET:
            self._execute_market_order(order)
        else:
            self.portfolio.orders.append(order)

        return order

    def _execute_market_order(self, order: Order):
        """Execute a market order immediately"""
        current_price = self.market_prices.get(order.symbol)
        if not current_price:
            raise ValueError(f"No market price available for {order.symbol}")

        order.filled_price = current_price
        order.filled_quantity = order.quantity
        order.status = OrderStatus.FILLED

        # Create position or update existing
        self._update_position(order)

        # Record trade
        self._record_trade(order)

    def _check_limit_orders(self, symbol: str, current_price: float):
        """Check and execute limit orders"""
        for order in self.portfolio.orders[:]:  # Copy to avoid modification during iteration
            if order.symbol != symbol or order.type != OrderType.LIMIT:
                continue

            should_execute = False
            if order.side == OrderSide.BUY and current_price <= order.price:
                should_execute = True
            elif order.side == OrderSide.SELL and current_price >= order.price:
                should_execute = True

            if should_execute:
                order.filled_price = current_price
                order.filled_quantity = order.quantity
                order.status = OrderStatus.FILLED

                self._update_position(order)
                self._record_trade(order)
                self.portfolio.orders.remove(order)

    def _check_position_triggers(self, symbol: str, current_price: float):
        """Check stop-loss and take-profit triggers"""
        for position in self.portfolio.positions[:]:
            if position.symbol != symbol:
                continue

            close_position = False
            exit_price = current_price

            if position.stop_loss:
                if position.side == OrderSide.BUY and current_price <= position.stop_loss:
                    close_position = True
                elif position.side == OrderSide.SELL and current_price >= position.stop_loss:
                    close_position = True

            if position.take_profit:
                if position.side == OrderSide.BUY and current_price >= position.take_profit:
                    close_position = True
                elif position.side == OrderSide.SELL and current_price <= position.take_profit:
                    close_position = True

            if close_position:
                self._close_position(position, exit_price)

    def _update_position(self, order: Order):
        """Update or create position from filled order"""
        existing_position = None
        for pos in self.portfolio.positions:
            if pos.symbol == order.symbol:
                existing_position = pos
                break

        if existing_position:
            # Update existing position
            if existing_position.side == order.side:
                # Same direction - increase position
                total_quantity = existing_position.quantity + order.quantity
                total_value = (existing_position.quantity * existing_position.entry_price) + (order.quantity * order.filled_price)
                new_entry_price = total_value / total_quantity

                existing_position.quantity = total_quantity
                existing_position.entry_price = new_entry_price
            else:
                # Opposite direction - reduce or close position
                if existing_position.quantity > order.quantity:
                    existing_position.quantity -= order.quantity
                elif existing_position.quantity < order.quantity:
                    # Close existing and open new position in opposite direction
                    remaining_quantity = order.quantity - existing_position.quantity
                    self._close_position(existing_position, order.filled_price)

                    # Create new position
                    new_position = Position(
                        symbol=order.symbol,
                        quantity=remaining_quantity,
                        entry_price=order.filled_price,
                        current_price=order.filled_price,
                        side=order.side,
                        unrealized_pnl=0.0,
                        timestamp=datetime.now()
                    )
                    self.portfolio.positions.append(new_position)
                else:
                    # Exact match - close position
                    self._close_position(existing_position, order.filled_price)
        else:
            # Create new position
            position = Position(
                symbol=order.symbol,
                quantity=order.quantity,
                entry_price=order.filled_price,
                current_price=order.filled_price,
                side=order.side,
                unrealized_pnl=0.0,
                timestamp=datetime.now()
            )
            self.portfolio.positions.append(position)

    def _close_position(self, position: Position, exit_price: float):
        """Close a position and calculate realized P&L"""
        realized_pnl = 0.0
        if position.side == OrderSide.BUY:
            realized_pnl = (exit_price - position.entry_price) * position.quantity
        else:
            realized_pnl = (position.entry_price - exit_price) * position.quantity

        # Create trade record
        trade = Trade(
            id=f"trade_{len(self.portfolio.trades) + 1}_{datetime.now().timestamp()}",
            symbol=position.symbol,
            side=position.side,
            quantity=position.quantity,
            price=exit_price,
            timestamp=datetime.now(),
            commission=abs(exit_price * position.quantity * self.commission_rate),
            realized_pnl=realized_pnl
        )

        self.portfolio.trades.append(trade)
        self.portfolio.balance += realized_pnl - trade.commission
        self.portfolio.positions.remove(position)

    def _record_trade(self, order: Order):
        """Record a trade from an order"""
        trade = Trade(
            id=f"trade_{len(self.portfolio.trades) + 1}_{datetime.now().timestamp()}",
            symbol=order.symbol,
            side=order.side,
            quantity=order.quantity,
            price=order.filled_price,
            timestamp=datetime.now(),
            commission=abs(order.filled_price * order.quantity * self.commission_rate),
            realized_pnl=0.0  # Will be calculated when position is closed
        )

        self.portfolio.trades.append(trade)
        self.portfolio.balance -= trade.commission

    def _update_portfolio_equity(self):
        """Update portfolio equity based on current positions"""
        total_unrealized_pnl = sum(pos.unrealized_pnl for pos in self.portfolio.positions)

        # Update unrealized P&L for each position
        for position in self.portfolio.positions:
            current_price = self.market_prices.get(position.symbol, position.current_price)
            position.current_price = current_price

            if position.side == OrderSide.BUY:
                position.unrealized_pnl = (current_price - position.entry_price) * position.quantity
            else:
                position.unrealized_pnl = (position.entry_price - current_price) * position.quantity

        total_unrealized_pnl = sum(pos.unrealized_pnl for pos in self.portfolio.positions)
        self.portfolio.equity = self.portfolio.balance + total_unrealized_pnl

        # Calculate used margin
        total_position_value = sum(
            abs(pos.quantity * pos.current_price) / self.portfolio.leverage
            for pos in self.portfolio.positions
        )
        self.portfolio.used_margin = total_position_value

        # Calculate margin level
        if self.portfolio.used_margin > 0:
            self.portfolio.margin_level = (self.portfolio.equity / self.portfolio.used_margin) * 100
        else:
            self.portfolio.margin_level = 100.0

        # Check for margin call
        if self.portfolio.margin_level <= MARGIN_CALL_LEVEL:
            self._handle_margin_call()

    def _handle_margin_call(self):
        """Handle margin call by closing positions"""
        print(f"Margin call triggered! Margin level: {self.portfolio.margin_level:.2f}%")

        # Close positions starting with the most unprofitable
        sorted_positions = sorted(
            self.portfolio.positions,
            key=lambda x: x.unrealized_pnl
        )

        for position in sorted_positions:
            if self.portfolio.margin_level > MARGIN_CALL_LEVEL:
                break
            current_price = self.market_prices.get(position.symbol, position.current_price)
            self._close_position(position, current_price)
            self._update_portfolio_equity()

    def get_portfolio_summary(self) -> Dict:
        """Get portfolio summary"""
        return {
            "balance": self.portfolio.balance,
            "equity": self.portfolio.equity,
            "used_margin": self.portfolio.used_margin,
            "margin_level": self.portfolio.margin_level,
            "leverage": self.portfolio.leverage,
            "total_positions": len(self.portfolio.positions),
            "total_orders": len(self.portfolio.orders),
            "total_trades": len(self.portfolio.trades)
        }

    def calculate_risk_metrics(self) -> RiskMetrics:
        """Calculate risk metrics using pandas"""
        if not self.portfolio.trades:
            return RiskMetrics(
                max_drawdown=0.0,
                sharpe_ratio=0.0,
                total_return=0.0,
                volatility=0.0,
                win_rate=0.0,
                profit_factor=0.0
            )

        # Convert trades to DataFrame
        trades_df = pd.DataFrame([
            {
                'timestamp': trade.timestamp,
                'pnl': trade.realized_pnl,
                'commission': trade.commission
            } for trade in self.portfolio.trades
        ])

        trades_df = trades_df.sort_values('timestamp')
        trades_df['cumulative_pnl'] = trades_df['pnl'].cumsum()
        trades_df['cumulative_return'] = trades_df['cumulative_pnl'] / abs(trades_df['cumulative_pnl'].iloc[0]) if len(trades_df) > 0 else 0

        # Max drawdown
        rolling_max = trades_df['cumulative_pnl'].expanding().max()
        drawdowns = trades_df['cumulative_pnl'] - rolling_max
        max_drawdown = abs(drawdowns.min()) if len(drawdowns) > 0 else 0.0

        # Total return
        total_return = trades_df['cumulative_pnl'].iloc[-1] if len(trades_df) > 0 else 0.0

        # Volatility (daily returns)
        if len(trades_df) > 1:
            trades_df['daily_return'] = trades_df['pnl'].pct_change().fillna(0)
            volatility = trades_df['daily_return'].std() * np.sqrt(252)  # Annualized
        else:
            volatility = 0.0

        # Sharpe ratio (assuming 2% risk-free rate)
        risk_free_rate = 0.02
        if volatility > 0:
            sharpe_ratio = (trades_df['daily_return'].mean() - risk_free_rate/252) / volatility
        else:
            sharpe_ratio = 0.0

        # Win rate
        winning_trades = len(trades_df[trades_df['pnl'] > 0])
        win_rate = winning_trades / len(trades_df) if len(trades_df) > 0 else 0.0

        # Profit factor
        gross_profit = trades_df[trades_df['pnl'] > 0]['pnl'].sum()
        gross_loss = abs(trades_df[trades_df['pnl'] < 0]['pnl'].sum())
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')

        return RiskMetrics(
            max_drawdown=max_drawdown,
            sharpe_ratio=sharpe_ratio,
            total_return=total_return,
            volatility=volatility,
            win_rate=win_rate,
            profit_factor=profit_factor
        )