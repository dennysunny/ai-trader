import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Injectable()
export class AiService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async analyzeData(data: any): Promise<any> {
    const url = `${this.config.get<string>('AI_ENGINE_URL')}/analysis/analyze`;
    const response = await firstValueFrom(this.http.post(url, data));
    return response.data;
  }
}
