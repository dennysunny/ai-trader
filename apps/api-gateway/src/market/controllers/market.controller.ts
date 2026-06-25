import { Controller, Get } from '@nestjs/common';

import { MarketService } from '../services/market.service';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('status')
  async getStatus() {
    return this.marketService.getStatus();
  }
}
