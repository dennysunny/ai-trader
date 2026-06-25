export interface MarketTick {
  symbol: string;
  exchange: string;
  token: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}
