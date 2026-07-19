import { Module } from '@nestjs/common';

import { MarketGateway } from '../websocket/market/market.gateway';
import { MarketTestController } from './controllers/market-test.controller';
import { MarketController } from './controllers/market.controller';
import { MarketCandleLoggerListener } from './listeners/market-candle-logger.listener';
import { MarketTickLoggerListener } from './listeners/market-tick-logger.listener';
import { TickProcessorService } from './pipeline/tick-processor.service';
import { CandleBufferService } from './services/candles/candle-buffer.service';
import { CandleBuilderService } from './services/candles/candle-builder.service';
import { MarketService } from './services/market.service';

/*
 * GOAL:
 * Build a Market Module that doesn't know anything about AI or Angular.
 * It just receives market data and publish it
 */
@Module({
  imports: [],
  controllers: [MarketController, MarketTestController],
  providers: [
    /* Gateways */
    MarketGateway,
    /* Services */
    MarketService,
    TickProcessorService,
    CandleBuilderService,
    CandleBufferService,
    /* Listeners */
    MarketTickLoggerListener,
    MarketCandleLoggerListener,
  ],
  exports: [],
})
export class MarketModule {}
