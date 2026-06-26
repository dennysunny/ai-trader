import { IsString, IsNumber } from 'class-validator';

export class MarketAnalysisRequestDto {
  @IsString()
  symbol!: string;

  @IsNumber()
  ltp!: number;
}
