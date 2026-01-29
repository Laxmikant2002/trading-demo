import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Trading Engine Configuration
INITIAL_BALANCE = float(os.getenv("INITIAL_BALANCE", "10000.0"))
DEFAULT_LEVERAGE = float(os.getenv("DEFAULT_LEVERAGE", "10.0"))
COMMISSION_RATE = float(os.getenv("COMMISSION_RATE", "0.001"))  # 0.1%

# Risk Management
MARGIN_CALL_LEVEL = float(os.getenv("MARGIN_CALL_LEVEL", "50.0"))  # 50%
MAX_LEVERAGE = float(os.getenv("MAX_LEVERAGE", "100.0"))

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

# Database Configuration (if needed in future)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./trading_engine.db")

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")