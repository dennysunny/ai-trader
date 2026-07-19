import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import { Timeframe } from '../../../shared/common.enum';
import { MarketCandleClosedEvent } from '../../events/market-candle-closed.event';
import { MarketTickReceivedEvent } from '../../events/market-tick-received.event';
import { ICandle } from '../../interfaces/candle.interface';
import { IMarketTick } from '../../interfaces/market-tick.interface';

/**
 * CandleBuilderService is responsible for building market candles from incoming market ticks.
 * It listens for the 'market.tick.received' event, processes the incoming ticks, and constructs candles based on the tick data.
 * When a candle is completed (i.e., when a new tick belongs to a new minute), it emits a 'market.candle.closed' event with the completed candle data.
 * When a new tick is received, it checks if it belongs to the current candle or if a new candle needs to be created.
 * If a new candle is created, the previous candle is closed and emitted as an event.
 * The service maintains a map of active candles, keyed by a unique identifier for each candle (exchange, token, and timeframe).
 */
@Injectable()
export class CandleBuilderService {
  private readonly logger = new Logger(CandleBuilderService.name);

  /** A map to store the active candles. */
  private readonly candles = new Map<string, ICandle>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Handles the reception of a market tick event.
   * This method processes the incoming market tick, updates the corresponding candle, and emits a candle closed event if the candle is complete.
   * @param event - The MarketTickReceivedEvent containing the market tick data
   */
  @OnEvent('market.tick.received')
  handleTick(event: MarketTickReceivedEvent): void {
    const tick = event.tick;

    // If the last traded price (LTP) is null, we cannot process this tick for candle building.
    if (tick.ltp === null) {
      return;
    }

    const candleStart = this.getMinuteStart(tick.timestamp);
    const key = `${tick.exchange}:${tick.token}:1m`;

    // Check if there is an existing candle for this key.
    const current = this.candles.get(key);

    // If there is no current candle, we create a new one.
    if (!current) {
      this.createCandle(key, tick, candleStart);
      return;
    }

    // If the current candle's start time matches the calculated candle start time, we update the existing candle.
    if (current.startTime.getTime() === candleStart.getTime()) {
      this.updateCandle(current, tick);
      return;
    }

    // Tick belongs to a new minute. Therefore the previous candle is complete.
    this.closeCandle(current);

    // Create a new candle for the new minute.
    this.createCandle(key, tick, candleStart);
  }

  /**
   * Method to create a new candle based on the incoming market tick.
   * If a candle for the given key already exists, it will be overwritten.
   * Open, high, low, and close prices are initialized to the last traded price (LTP) of the tick.
   * @param {string} key - A unique key representing the candle, typically in the format "exchange:token:timeframe".
   * @param {IMarketTick} tick - The market tick data used to initialize the candle.
   * @param {Date} startTime - The start time of the candle.
   */
  private createCandle(key: string, tick: IMarketTick, startTime: Date): void {
    const endTime = new Date(startTime.getTime() + 60_000);

    const candle: ICandle = {
      symbol: tick.symbol,
      exchange: tick.exchange,
      token: tick.token,
      timeframe: Timeframe.ONE_MINUTE,
      startTime,
      endTime,
      open: tick.ltp!,
      high: tick.ltp!,
      low: tick.ltp!,
      close: tick.ltp!,
      volume: tick.volume,
    };

    this.candles.set(key, candle);
  }

  /**
   * Method to update an existing candle with new market tick data.
   * It updates the high, low, and close prices based on the last traded price (LTP) of the tick.
   * If the tick's volume is not null, it also updates the candle's volume.
   * @param {ICandle} candle - The existing candle to be updated.
   * @param {IMarketTick} tick - The market tick data used to update the candle.
   */
  private updateCandle(candle: ICandle, tick: IMarketTick): void {
    const price = tick.ltp!;

    // Calculate the new high and low prices based on the last traded price (LTP) of the tick.
    candle.high = Math.max(candle.high, price);
    candle.low = Math.min(candle.low, price);
    candle.close = price;

    if (tick.volume !== null) {
      candle.volume = tick.volume;
    }
  }

  /**
   * Method to close an existing candle and emit a closed event.
   * @param {ICandle} candle - The candle to be closed.
   */
  private closeCandle(candle: ICandle): void {
    this.logger.log(
      `${candle.symbol} | 1m | ` +
        `O:${candle.open} ` +
        `H:${candle.high} ` +
        `L:${candle.low} ` +
        `C:${candle.close}`,
    );

    // Emit the candle closed event to notify other parts of the application that a candle has been completed.
    this.eventEmitter.emit(
      'market.candle.closed',
      new MarketCandleClosedEvent({ ...candle }),
    );
  }

  /**
   * Method to calculate the start time of the minute for a given timestamp.
   * It sets the seconds and milliseconds to zero, effectively rounding down to the nearest minute.
   * @param {Date} timestamp - The timestamp for which to calculate the minute start time.
   * @returns {Date} - The start time of the minute for the given timestamp.
   */
  private getMinuteStart(timestamp: Date): Date {
    const date = new Date(timestamp);
    date.setSeconds(0, 0);

    return date;
  }
}
