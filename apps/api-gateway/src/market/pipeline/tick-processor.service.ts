import { Injectable } from '@nestjs/common';

import { MarketTick } from '../interfaces/market-tick.interface';

@Injectable()
export class TickProcessorService {
  processTick(tick: MarketTick) {
    //validate and process the tick data
  }
}
