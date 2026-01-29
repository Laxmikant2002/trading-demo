from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP_LOSS = "stop_loss"
    TAKE_PROFIT = "take_profit"

class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"

class OrderStatus(str, Enum):
    PENDING = "pending"
    FILLED = "filled"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

class Position(BaseModel):
    symbol: str
    quantity: float
    entry_price: float
    current_price: float
    side: OrderSide
    unrealized_pnl: float
    timestamp: datetime
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None

class Order(BaseModel):
    id: str
    symbol: str
    type: OrderType
    side: OrderSide
    quantity: float
    price: Optional[float] = None
    stop_price: Optional[float] = None
    status: OrderStatus = OrderStatus.PENDING
    timestamp: datetime
    filled_quantity: float = 0.0
    filled_price: Optional[float] = None

class Trade(BaseModel):
    id: str
    symbol: str
    side: OrderSide
    quantity: float
    price: float
    timestamp: datetime
    commission: float
    realized_pnl: float

class Portfolio(BaseModel):
    balance: float
    equity: float
    used_margin: float
    margin_level: float
    leverage: float = 1.0
    positions: List[Position] = []
    orders: List[Order] = []
    trades: List[Trade] = []

class RiskMetrics(BaseModel):
    max_drawdown: float
    sharpe_ratio: float
    total_return: float
    volatility: float
    win_rate: float
    profit_factor: float

class OrderRequest(BaseModel):
    symbol: str
    type: OrderType
    side: OrderSide
    quantity: float
    price: Optional[float] = None
    stop_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None

class PortfolioUpdate(BaseModel):
    balance: Optional[float] = None
    leverage: Optional[float] = None