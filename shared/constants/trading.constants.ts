export const ORDER_TYPES = {
  BUY: "buy",
  SELL: "sell",
} as const;

export const ORDER_STATUS = {
  PENDING: "pending",
  EXECUTED: "executed",
  CANCELLED: "cancelled",
} as const;

export const TRADE_FEES = {
  COMMISSION: 0.01, // 1%
  MIN_FEE: 1.0,
};
