import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

/**
 * Service to generate a websocket token for Alice Blue.
 * It uses the sessionId to create a double SHA-256 hash, which is used as the websocket token.
 */
@Injectable()
export class WebsocketTokenService {
  /**
   * Method to generate a websocket token from a sessionId.
   * It creates a double SHA-256 hash of the sessionId.
   * @param {string} sessionId - The sessionId to be hashed to generate the websocket token
   * @returns {string} - The generated websocket token
   */
  generate(sessionId: string): string {
    const firstHash = createHash('sha256').update(sessionId).digest('hex');

    return createHash('sha256').update(firstHash).digest('hex');
  }
}
