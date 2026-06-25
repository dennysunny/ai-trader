import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { MarketModule } from './market/market.module';
import { MarketGateway } from './websocket/market/market.gateway';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    HealthModule,
    MarketModule,
    WebsocketModule,
  ],
  providers: [MarketGateway],
})
export class AppModule {}
