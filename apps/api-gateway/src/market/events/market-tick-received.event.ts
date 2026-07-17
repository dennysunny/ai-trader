import { IMarketTick } from '../interfaces/market-tick.interface';

export class MarketTickReceivedEvent {
  constructor(public readonly tick: IMarketTick) {}
}
