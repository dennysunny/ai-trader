import { Injectable } from '@nestjs/common';

import { MarketTick } from '../../../market/interfaces/market-tick.interface';
import { IBroker } from '../../interfaces/broker.interface';

@Injectable()
export class AliceBlueProvider implements IBroker {
  async connect(): Promise<void> {
    // Implementation for connecting to Alice Blue
  }

  async disconnect(): Promise<void> {
    // Implementation for disconnecting from Alice Blue
  }

  async subscribe(tokens: string[]): Promise<void> {
    // Implementation for subscribing to tokens
  }

  async unsubscribe(tokens: string[]): Promise<void> {
    // Implementation for unsubscribing from tokens
  }

  onTick(callback: (tick: MarketTick) => void): void {
    // Implementation for handling tick events
  }
}
