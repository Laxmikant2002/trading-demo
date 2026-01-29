from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List
from datetime import datetime

from models import (
    OrderRequest, Portfolio, RiskMetrics, Order, Position, Trade
)
from trading_engine import TradingEngine
from config import INITIAL_BALANCE, DEFAULT_LEVERAGE, API_HOST, API_PORT

app = FastAPI(
    title="Trading Engine API",
    description="Advanced trading engine with order execution, P&L calculations, and risk management",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global trading engine instance
trading_engine = TradingEngine(initial_balance=INITIAL_BALANCE, leverage=DEFAULT_LEVERAGE)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Trading Engine API", "status": "running"}

@app.post("/orders", response_model=Order)
async def place_order(order_request: OrderRequest):
    """Place a new order"""
    try:
        order = trading_engine.place_order(order_request)
        return order
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/orders", response_model=List[Order])
async def get_orders():
    """Get all orders"""
    return trading_engine.portfolio.orders

@app.get("/positions", response_model=List[Position])
async def get_positions():
    """Get all open positions"""
    return trading_engine.portfolio.positions

@app.get("/trades", response_model=List[Trade])
async def get_trades():
    """Get trade history"""
    return trading_engine.portfolio.trades

@app.get("/portfolio")
async def get_portfolio():
    """Get portfolio summary"""
    summary = trading_engine.get_portfolio_summary()
    return summary

@app.put("/portfolio")
async def update_portfolio(balance: float = None, leverage: float = None):
    """Update portfolio settings"""
    if balance is not None:
        trading_engine.portfolio.balance = balance
    if leverage is not None:
        trading_engine.portfolio.leverage = leverage
    trading_engine._update_portfolio_equity()
    return {"message": "Portfolio updated successfully"}

@app.post("/market-price/{symbol}")
async def update_market_price(symbol: str, price: float):
    """Update market price for a symbol"""
    try:
        trading_engine.update_market_price(symbol, price)
        return {"message": f"Market price updated for {symbol}: ${price}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/risk-metrics", response_model=RiskMetrics)
async def get_risk_metrics():
    """Get portfolio risk metrics"""
    return trading_engine.calculate_risk_metrics()

@app.post("/reset")
async def reset_portfolio():
    """Reset portfolio to initial state"""
    global trading_engine
    trading_engine = TradingEngine(initial_balance=10000.0, leverage=10.0)
    return {"message": "Portfolio reset successfully"}

@app.get("/performance")
async def get_performance():
    """Get detailed performance metrics"""
    risk_metrics = trading_engine.calculate_risk_metrics()
    portfolio_summary = trading_engine.get_portfolio_summary()

    # Calculate additional metrics
    total_trades = len(trading_engine.portfolio.trades)
    winning_trades = len([t for t in trading_engine.portfolio.trades if t.realized_pnl > 0])
    losing_trades = total_trades - winning_trades

    total_commission = sum(t.commission for t in trading_engine.portfolio.trades)
    total_realized_pnl = sum(t.realized_pnl for t in trading_engine.portfolio.trades)

    return {
        "portfolio": portfolio_summary,
        "risk_metrics": risk_metrics,
        "trading_stats": {
            "total_trades": total_trades,
            "winning_trades": winning_trades,
            "losing_trades": losing_trades,
            "total_commission": total_commission,
            "total_realized_pnl": total_realized_pnl,
            "net_pnl": total_realized_pnl - total_commission
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host=API_HOST, port=API_PORT)