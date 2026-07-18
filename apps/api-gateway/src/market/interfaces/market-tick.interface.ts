export interface IMarketTick {
  token: string;
  exchange: string;
  symbol: string;
  instrumentType?: string;
  ltp: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  timestamp: Date;
}
