import { Controller, Get, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { MarketCandleClosedEvent } from '../events/market-candle-closed.event';
import { MarketTickReceivedEvent } from '../events/market-tick-received.event';
import { ICandle } from '../interfaces/candle.interface';
import { IMarketTick } from '../interfaces/market-tick.interface';
import { CandleBufferService } from '../services/candles/candle-buffer.service';
import { Timeframe } from '../../shared/common.enum';

/**
 * MarketTestController is a test controller for simulating market tick events.
 * It provides an endpoint to publish a series of market ticks to test the candle building and event handling functionality.
 * The testCandle method emits a predefined set of market ticks, which can be used to verify the correct behavior of the system.
 * Endpoint: POST /market/test/candle
 * Endpoint: GET /market/test/candles
 * Endpoint: POST /market/test/generate-history
 * Endpoint: GET /market/test/candle-status
 */
@Controller('market/test')
export class MarketTestController {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly candleBuffer: CandleBufferService,
  ) {}

  @Get('candles')
  getCandles() {
    return this.candleBuffer.getLatest(
      'NSE',
      '26000',
      Timeframe.ONE_MINUTE,
      50,
    );
  }

  @Post('generate-history')
  generateHistory() {
    const startTime = new Date('2026-07-18T09:15:00+05:30');

    for (let i = 0; i < 50; i++) {
      const basePrice = 25000 + i * 5;

      const candle: ICandle = {
        symbol: 'NIFTY',
        exchange: 'NSE',
        token: '26000',
        timeframe: Timeframe.ONE_MINUTE,
        startTime: new Date(startTime.getTime() + i * 60_000),
        endTime: new Date(startTime.getTime() + (i + 1) * 60_000),
        open: basePrice,
        high: basePrice + 10,
        low: basePrice - 5,
        close: basePrice + 5,
        volume: 1000 + i * 10,
      };

      this.eventEmitter.emit(
        'market.candle.closed',
        new MarketCandleClosedEvent(candle),
      );
    }

    return {
      generated: this.candleBuffer.getAll('NSE', '26000', Timeframe.ONE_MINUTE),
    };
  }

  @Get('candle-status')
  getCandleStatus() {
    const count = this.candleBuffer.getCount(
      'NSE',
      '26000',
      Timeframe.ONE_MINUTE,
    );

    return {
      instrument: 'NIFTY',
      timeframe: Timeframe.ONE_MINUTE,
      candleCount: count,
      readyForRSI14: this.candleBuffer.hasEnoughData(
        'NSE',
        '26000',
        Timeframe.ONE_MINUTE,
        15,
      ),
      readyForEMA20: this.candleBuffer.hasEnoughData(
        'NSE',
        '26000',
        Timeframe.ONE_MINUTE,
        20,
      ),
      readyForEMA50: this.candleBuffer.hasEnoughData(
        'NSE',
        '26000',
        Timeframe.ONE_MINUTE,
        50,
      ),
    };
  }

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
