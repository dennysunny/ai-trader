import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ICandle } from '../../interfaces/candle.interface';
import { MarketCandleClosedEvent } from '../../events/market-candle-closed.event';

/**
 * CandleBufferService is responsible for buffering market candles.
 * It listens for the 'market.candle.closed' event, stores the closed candles in memory, and provides methods to retrieve the buffered candles.
 * The service maintains a map of buffers, keyed by a unique identifier for each candle (exchange, token, and timeframe).
 * It also enforces a maximum buffer size to prevent unlimited memory growth.
 */
@Injectable()
export class CandleBufferService {
  /** Variable to store the logger instance */
  private readonly logger = new Logger(CandleBufferService.name);

  /** Map to store the buffered candles, keyed by a unique identifier for each candle */
  private readonly buffers = new Map<string, ICandle[]>();

  /** Maximum number of candles to store in each buffer */
  private readonly maxCandles = 200;

  /**
   * Event handler for the 'market.candle.closed' event.
   * It adds the closed candle to the appropriate buffer based on its exchange, token, and timeframe.
   * @param {MarketCandleClosedEvent} event - The MarketCandleClosedEvent containing the closed candle data
   */
  @OnEvent('market.candle.closed')
  handleCandleClosed(event: MarketCandleClosedEvent): void {
    this.add(event.candle);
  }

  /**
   * Method to add a closed candle to the appropriate buffer.
   * It checks if a buffer exists for the candle's exchange, token, and timeframe.
   * If not, it creates a new buffer. It then adds the candle to the buffer and ensures that the buffer size does not exceed the maximum limit.
   * @param {ICandle} candle - The closed candle to add to the buffer
   */
  add(candle: ICandle): void {
    const key = this.getKey(candle.exchange, candle.token, candle.timeframe);
    let candles = this.buffers.get(key);

    if (!candles) {
      candles = [];
      this.buffers.set(key, candles);
    }

    /*
     * Check if the candle already exists in the buffer based on its start time.
     * If it exists, update the existing candle;
     * otherwise, add the new candle to the buffer.
     */
    const existingIndex = candles.findIndex(
      (existing) => existing.startTime.getTime() === candle.startTime.getTime(),
    );

    if (existingIndex !== -1) {
      candles[existingIndex] = {
        ...candle,
      };
    } else {
      candles.push({
        ...candle,
      });
    }

    // Sort the candles in the buffer by their start time to maintain chronological order.
    candles.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // Ensure that the buffer size does not exceed the maximum limit by removing the oldest candles if necessary.
    while (candles.length > this.maxCandles) {
      candles.shift();
    }

    this.logger.debug(`${key} | Buffer size: ${candles.length}`);
  }

  /**
   * Method to retrieve the latest candles from the buffer for a specific exchange, token, and timeframe.
   * It returns the specified number of latest candles, up to the limit provided.
   * @param {string} exchange - The exchange of the candles to retrieve
   * @param {string} token - The token of the candles to retrieve
   * @param {string} timeframe - The timeframe of the candles to retrieve
   * @param {number} limit - The maximum number of latest candles to retrieve
   * @returns {ICandle[]} - An array of the latest candles from the buffer
   */
  getLatest(
    exchange: string,
    token: string,
    timeframe: string,
    limit: number,
  ): ICandle[] {
    const key = this.getKey(exchange, token, timeframe);
    const candles = this.buffers.get(key) ?? [];

    return candles.slice(-limit).map((candle) => ({
      ...candle,
    }));
  }

  /**
   * Method to retrieve all candles from the buffer for a specific exchange, token, and timeframe.
   * It returns a copy of the entire buffer for the specified key.
   * @param {string} exchange - The exchange of the candles to retrieve
   * @param {string} token - The token of the candles to retrieve
   * @param {string} timeframe - The timeframe of the candles to retrieve
   * @returns {ICandle[]} - An array of all candles from the buffer for the specified key
   */
  getAll(exchange: string, token: string, timeframe: string): ICandle[] {
    const key = this.getKey(exchange, token, timeframe);

    return (this.buffers.get(key) ?? []).map((candle) => ({
      ...candle,
    }));
  }

  /**
   * Method to get the count of candles in the buffer for a specific exchange, token, and timeframe.
   * @param {string} exchange - The exchange of the candles to retrieve
   * @param {string} token - The token of the candles to retrieve
   * @param {string} timeframe - The timeframe of the candles to retrieve
   * @returns {number} - The count of candles in the buffer for the specified key
   */
  getCount(exchange: string, token: string, timeframe: string): number {
    const key = this.getKey(exchange, token, timeframe);

    return this.buffers.get(key)?.length ?? 0;
  }

  /**
   * Method to check if the buffer has enough candles for a specific exchange, token, and timeframe.
   * It compares the count of candles in the buffer with the required number of candles.
   * @param {string} exchange - The exchange of the candles to check
   * @param {string} token - The token of the candles to check
   * @param {string} timeframe - The timeframe of the candles to check
   * @param {number} requiredCandles - The minimum number of candles required
   * @returns {boolean} - A boolean indicating whether the buffer has enough data
   */
  hasEnoughData(
    exchange: string,
    token: string,
    timeframe: string,
    requiredCandles: number,
  ): boolean {
    return this.getCount(exchange, token, timeframe) >= requiredCandles;
  }

  /**
   * Method to clear the buffer for a specific exchange, token, and timeframe.
   * If no parameters are provided, it clears the entire buffer.
   * @param {string} exchange - The exchange of the candles to clear
   * @param {string} token - The token of the candles to clear
   * @param {string} timeframe - The timeframe of the candles to clear
   */
  clear(exchange?: string, token?: string, timeframe?: string): void {
    // If no parameters are provided, clear the entire buffer.
    if (!exchange || !token || !timeframe) {
      this.buffers.clear();
      return;
    }

    const key = this.getKey(exchange, token, timeframe);
    this.buffers.delete(key);
  }

  /**
   * Method to generate a unique key for the buffer based on exchange, token, and timeframe.
   * The key is used to identify the buffer for a specific combination of exchange, token, and timeframe.
   * @param {string} exchange - The exchange of the candles
   * @param {string} token - The token of the candles
   * @param {string} timeframe - The timeframe of the candles
   * @returns {string} - A unique key representing the buffer for the specified combination
   */
  private getKey(exchange: string, token: string, timeframe: string): string {
    return `${exchange}:${token}:${timeframe}`;
  }
}
