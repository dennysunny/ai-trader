import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AliceBlueAuthController } from './auth/alice-blue/alice-blue-auth.controller';
import { AliceBlueAuthService } from './auth/alice-blue/alice-blue-auth.service';
import { ChecksumService } from './auth/alice-blue/checksum.service';
import { AliceBlueWebsocketService } from './websocket/alice-blue/alice-blue-websocket.service';
import { WebsocketTokenService } from './websocket/alice-blue/websocket-token.service';
import { AliceBlueWebSocketController } from './websocket/alice-blue/alice-blue-websocket.controller';

@Module({
  imports: [HttpModule],
  controllers: [AliceBlueAuthController, AliceBlueWebSocketController],
  providers: [
    AliceBlueAuthService,
    ChecksumService,
    AliceBlueWebsocketService,
    WebsocketTokenService,
  ],
  exports: [AliceBlueAuthService, AliceBlueWebsocketService],
})
export class BrokerModule {}
