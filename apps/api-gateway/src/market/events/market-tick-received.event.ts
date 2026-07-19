import { IMarketTick } from '../interfaces/market-tick.interface';

/**
 * Event class representing the reception of a market tick.
 * This event is emitted whenever a new market tick is received from the broker.
 * It contains the market tick data encapsulated in the IMarketTick interface.
 * Event Name: 'market.tick.received'
 */
export class MarketTickReceivedEvent {
  constructor(public readonly tick: IMarketTick) {}
}
