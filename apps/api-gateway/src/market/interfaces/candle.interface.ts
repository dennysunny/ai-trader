import { Timeframe } from '../../shared/common.enum';

export interface ICandle {
  symbol: string;
  exchange: string;
  token: string;
  timeframe: Timeframe.ONE_MINUTE;
  startTime: Date;
  endTime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}
