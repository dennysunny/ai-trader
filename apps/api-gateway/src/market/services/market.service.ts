import { Injectable } from '@nestjs/common';

import { MarketGateway } from '../../websocket/market/market.gateway';

@Injectable()
export class MarketService {
  constructor(private readonly marketGateway: MarketGateway) {}

  onModuleInit() {
    this.startMockTicks();
  }

  getStatus() {
    return {
      service: 'Market Service',
      status: 'Running',
      provider: 'Not Connected',
      websocket: 'Disconnected',
      lastTick: null,
    };
  }

  startMockTicks() {
    setInterval(() => {
      this.marketGateway.broadcastMarketUpdate({
        symbol: 'NIFTY',
        instrumentType: 'NFO',
        ltp: 25000 + Math.random() * 100,
        exchange: 'NSE',
        token: '12345',
        open: 25000,
        high: 25100,
        low: 24900,
        close: 25050,
        volume: Math.floor(Math.random() * 1000),
        timestamp: new Date(),
      });
    }, 1000);
  }
}
