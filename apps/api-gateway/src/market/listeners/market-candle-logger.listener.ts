import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MarketCandleClosedEvent } from '../events/market-candle-closed.event';

/**
 * MarketCandleLoggerListener is a listener that logs market candle events.
 * It listens for the 'market.candle.closed' event and logs the details of the closed candle.
 */
@Injectable()
export class MarketCandleLoggerListener {
  private readonly logger = new Logger(MarketCandleLoggerListener.name);

  @OnEvent('market.candle.closed')
  handle(event: MarketCandleClosedEvent): void {
    const candle = event.candle;

    this.logger.log(
      [
        candle.symbol,
        candle.timeframe,
        `O:${candle.open}`,
        `H:${candle.high}`,
        `L:${candle.low}`,
        `C:${candle.close}`,
      ].join(' | '),
    );
  }
}
