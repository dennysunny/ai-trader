import { Module } from '@nestjs/common';

import { MarketService } from './services/market.service';
import { MarketController } from './controllers/market.controller';

/*
 * GOAL:
 * Build a Market Module that doesn't know anything about AI or Angular.
 * It just receives market data and publish it
 */
@Module({
  imports: [],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [],
})
export class MarketModule {}
