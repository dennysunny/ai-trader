import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class WebsocketTokenService {
  generate(sessionId: string): string {
    const firstHash = createHash('sha256').update(sessionId).digest('hex');

    return createHash('sha256').update(firstHash).digest('hex');
  }
}
