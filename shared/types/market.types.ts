export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
}

export interface Asset {
  symbol: string;
  name: string;
  type: string;
  currentPrice: number;
}
