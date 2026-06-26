import { Candle } from './candle';
import { Instrument } from './instrument';

export interface AnalysisRequest {
  instrument: Instrument;
  candles: Candle[];
}
