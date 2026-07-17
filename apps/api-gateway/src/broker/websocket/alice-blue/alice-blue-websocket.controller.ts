import { Controller, Get, Post } from '@nestjs/common';

import { AliceBlueWebsocketService } from './alice-blue-websocket.service';

/**
 * AliceBlueWebSocketController is a controller that handles WebSocket connection requests for the Alice Blue broker.
 * Controller Methods:
 * - connect: Initiates a WebSocket connection to Alice Blue.
 * - disconnect: Terminates the WebSocket connection to Alice Blue.
 * - status: Returns the current state of the WebSocket connection.
 * - subscribeIndices: A temporary endpoint for subscribing to NIFTY and BANKNIFTY indices.
 */
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

  // Temporary endpoint for subscribing to NIFTY and BANKNIFTY indices
  @Post('subscribe/indices')
  subscribeIndices() {
    this.websocketService.subscribeMarketData([
      {
        exchange: 'NSE',
        token: '26000',
      },
      {
        exchange: 'NSE',
        token: '26009',
      },
    ]);

    return {
      subscribed: true,

      instruments: ['NIFTY', 'BANKNIFTY'],
    };
  }
}
