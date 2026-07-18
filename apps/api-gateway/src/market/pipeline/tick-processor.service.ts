import { Injectable } from '@nestjs/common';

import { IMarketTick } from '../interfaces/market-tick.interface';

@Injectable()
export class TickProcessorService {
  processTick(tick: IMarketTick) {
    //validate and process the tick data
  }
}
