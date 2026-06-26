import { Body, Controller, Get, Post } from '@nestjs/common';

import { AiService } from '../services/ai.service';
import { MarketAnalysisRequestDto } from '../dto/market-analysis-request.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  async analyzeData(@Body() dto: MarketAnalysisRequestDto): Promise<any> {
    const result = await this.aiService.analyzeData(dto);
    return result;
  }
}
