import { Module } from '@nestjs/common';

import { MarketGateway } from '../websocket/market/market.gateway';
import { MarketController } from './controllers/market.controller';
import { MarketTickLoggerListener } from './listeners/market-tick-logger.listener';
import { TickProcessorService } from './pipeline/tick-processor.service';
import { MarketService } from './services/market.service';

/*
 * GOAL:
 * Build a Market Module that doesn't know anything about AI or Angular.
 * It just receives market data and publish it
 */
@Module({
  imports: [],
  controllers: [MarketController],
  providers: [
    MarketService,
    MarketGateway,
    TickProcessorService,
    MarketTickLoggerListener,
  ],
  exports: [],
})
export class MarketModule {}
