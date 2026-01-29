export interface Order {
  id: string;
  userId: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  status: "pending" | "executed" | "cancelled";
}

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  quantity: number;
  price: number;
  timestamp: Date;
}

export interface Portfolio {
  userId: string;
  holdings: Holding[];
  cash: number;
}

export interface Holding {
  symbol: string;
  quantity: number;
  averagePrice: number;
}
