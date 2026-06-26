import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiModule } from './ai/ai.module';
import { BrokerModule } from './broker/broker.module';
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
    WebsocketModule,
    DatabaseModule,
    HealthModule,
    MarketModule,
    BrokerModule,
    AiModule,
  ],
  providers: [MarketGateway],
})
export class AppModule {}
