import { Injectable } from '@nestjs/common';

import { IMarketTick } from '../../../market/interfaces/market-tick.interface';
import { IAliceBlueMarketMessage } from '../../interfaces/alice-blue/alice-blue-broker.interface';

@Injectable()
export class AliceBlueMarketMapper {
  /**
   * Method to map Alice Blue market message to IMarketTick
   * If a previous tick is provided, it will use its values as fallback for missing fields in the message.
   * @param { IAliceBlueMarketMessage } message - The Alice Blue market message to be mapped
   * @param { IMarketTick } previous - Optional previous IMarketTick to use as fallback for missing fields
   * @returns { IMarketTick } - The mapped IMarketTick object
   */
  map(message: IAliceBlueMarketMessage, previous?: IMarketTick): IMarketTick {
    const timestamp = message.ft
      ? new Date(Number(message.ft) * 1000)
      : new Date();

    return {
      token: message.tk ?? previous?.token ?? '',
      exchange: message.e ?? previous?.exchange ?? '',
      symbol: message.ts ?? previous?.symbol ?? '',
      ltp: this.number(message.lp, previous?.ltp),
      open: this.number(message.o, previous?.open),
      high: this.number(message.h, previous?.high),
      low: this.number(message.l, previous?.low),
      close: this.number(message.c, previous?.close),
      volume: this.number(message.v, previous?.volume),
      timestamp,
    };
  }

  /**
   * Method to convert a string to a number, with an optional fallback value.
   * @param { string | undefined } value - The string value to be converted to a number
   * @param { number | null | undefined } fallback - An optional fallback value to return if the conversion fails or if the value is undefined
   * @returns { number | null } - The converted number or the fallback value, or null if both are undefined
   */
  private number(
    value: string | undefined,
    fallback: number | null | undefined,
  ): number | null {
    if (value === undefined) {
      return fallback ?? null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : (fallback ?? null);
  }
}
