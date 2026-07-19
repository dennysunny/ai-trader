import { Controller, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { MarketTickReceivedEvent } from '../events/market-tick-received.event';
import { IMarketTick } from '../interfaces/market-tick.interface';

/**
 * MarketTestController is a test controller for simulating market tick events.
 * It provides an endpoint to publish a series of market ticks to test the candle building and event handling functionality.
 * The testCandle method emits a predefined set of market ticks, which can be used to verify the correct behavior of the system.
 * Endpoint: POST /market/test/candle
 */
@Controller('market/test')
export class MarketTestController {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Post('candle')
  testCandle() {
    const ticks: IMarketTick[] = [
      {
        token: '26000',
        exchange: 'NSE',
        symbol: 'NIFTY',
        ltp: 25000,
        open: 25000,
        high: 25000,
        low: 25000,
        close: 25000,
        volume: null,
        timestamp: new Date('2026-07-18T09:15:05+05:30'),
      },
      {
        token: '26000',
        exchange: 'NSE',
        symbol: 'NIFTY',
        ltp: 25010,
        open: 25000,
        high: 25010,
        low: 25000,
        close: 25010,
        volume: null,
        timestamp: new Date('2026-07-18T09:15:20+05:30'),
      },
      {
        token: '26000',
        exchange: 'NSE',
        symbol: 'NIFTY',
        ltp: 24990,
        open: 25000,
        high: 25010,
        low: 24990,
        close: 24990,
        volume: null,
        timestamp: new Date('2026-07-18T09:15:40+05:30'),
      },
      {
        token: '26000',
        exchange: 'NSE',
        symbol: 'NIFTY',
        ltp: 25020,
        open: 25000,
        high: 25020,
        low: 24990,
        close: 25020,
        volume: null,
        timestamp: new Date('2026-07-18T09:15:55+05:30'),
      },
      {
        token: '26009',
        exchange: 'NSE',
        symbol: 'BANKNIFTY',
        ltp: 57000,
        open: 57000,
        high: 57000,
        low: 57000,
        close: 57000,
        volume: null,
        timestamp: new Date('2026-07-18T09:15:10+05:30'),
      },

      // New minute — this should close the 09:15 candle
      {
        token: '26000',
        exchange: 'NSE',
        symbol: 'NIFTY',
        ltp: 25030,
        open: 25030,
        high: 25030,
        low: 25030,
        close: 25030,
        volume: null,
        timestamp: new Date('2026-07-18T09:16:02+05:30'),
      },
      {
        token: '26009',
        exchange: 'NSE',
        symbol: 'BANKNIFTY',
        ltp: 57000,
        open: 57000,
        high: 57000,
        low: 57000,
        close: 57000,
        volume: null,
        timestamp: new Date('2026-07-18T09:15:10+05:30'),
      },
      {
        token: '26009',
        exchange: 'NSE',
        symbol: 'BANKNIFTY',
        ltp: 57100,
        open: 57000,
        high: 57100,
        low: 57000,
        close: 57100,
        volume: null,
        timestamp: new Date('2026-07-18T09:16:01+05:30'),
      },
    ];

    for (const tick of ticks) {
      this.eventEmitter.emit(
        'market.tick.received',
        new MarketTickReceivedEvent(tick),
      );
    }

    return {
      success: true,
      ticksPublished: ticks.length,
    };
  }
}
