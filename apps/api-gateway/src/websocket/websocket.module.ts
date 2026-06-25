import { Module } from '@nestjs/common';

import { MarketGateway } from './market/market.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [MarketGateway],
  exports: [MarketGateway],
})
export class WebsocketModule {}
