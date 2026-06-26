export interface MarketTick {
  token: string;
  exchange: string;
  symbol: string;
  instrumentType: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}
