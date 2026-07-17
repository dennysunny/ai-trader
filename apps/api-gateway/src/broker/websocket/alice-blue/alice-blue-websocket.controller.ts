import { Controller, Get, Post } from '@nestjs/common';

import { AliceBlueWebsocketService } from './alice-blue-websocket.service';

@Controller('broker/alice-blue')
export class AliceBlueWebSocketController {
  constructor(private readonly websocketService: AliceBlueWebsocketService) {}

  @Post('connect')
  connect() {
    this.websocketService.connect();

    return {
      message: 'Alice Blue WebSocket connection initiated',
    };
  }

  @Post('disconnect')
  disconnect() {
    this.websocketService.disconnect();

    return {
      message: 'Alice Blue WebSocket disconnected',
    };
  }

  @Get('status')
  status() {
    return {
      state: this.websocketService.getState(),
    };
  }
}
