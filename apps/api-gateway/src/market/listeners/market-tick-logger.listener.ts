import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MarketTickReceivedEvent } from '../events/market-tick-received.event';

@Injectable()
export class MarketTickLoggerListener {
  private readonly logger = new Logger(MarketTickLoggerListener.name);

  @OnEvent('market.tick.received')
  handle(event: MarketTickReceivedEvent) {
    const tick = event.tick;

    this.logger.log(`${tick.symbol || tick.token} | LTP: ${tick.ltp}`);
  }
}
