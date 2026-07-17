import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MarketTickReceivedEvent } from '../events/market-tick-received.event';

/**
 * MarketTickLoggerListener is a listener that logs market tick events.
 * It listens for the 'market.tick.received' event and logs the symbol/token and LTP of the received tick.
 */
@Injectable()
export class MarketTickLoggerListener {
  private readonly logger = new Logger(MarketTickLoggerListener.name);

  /**
   * Event handler for the 'market.tick.received' event.
   * It logs the symbol or token and the last traded price (LTP) of the received market tick.
   * @param event - The MarketTickReceivedEvent containing the market tick data
   */
  @OnEvent('market.tick.received')
  handle(event: MarketTickReceivedEvent) {
    const tick = event.tick;

    this.logger.log(`${tick.symbol || tick.token} | LTP: ${tick.ltp}`);
  }
}
