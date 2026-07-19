import { ICandle } from '../interfaces/candle.interface';

/**
 * Event class representing the closure of a market candle.
 * This event is emitted whenever a market candle is closed, indicating that the candle's data is finalized.
 * It contains the market candle data encapsulated in the ICandle interface.
 * Event Name: 'market.candle.closed'
 */
export class MarketCandleClosedEvent {
  constructor(public readonly candle: ICandle) {}
}
