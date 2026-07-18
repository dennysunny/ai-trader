import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createHash } from 'crypto';

/**
 * Service to generate checksum for Alice Blue authentication.
 * It uses the userId, authCode, and a secret key from the environment variables to create a SHA-256 hash.
 * This checksum is used to verify the authenticity of the callback from Alice Blue.
 */
@Injectable()
export class ChecksumService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Method to generate a checksum for Alice Blue authentication.
   * @param {string} userId - The user ID provided by Alice Blue during the authentication process
   * @param {string} authCode - The authentication code provided by Alice Blue during the authentication process
   * @returns {string} - The generated checksum as a SHA-256 hash string
   */
  generate(userId: string, authCode: string): string {
    const apiSecret = this.configService.getOrThrow<string>(
      'ALICE_BLUE_API_SECRET',
    );

    return createHash('sha256')
      .update(`${userId}${authCode}${apiSecret}`)
      .digest('hex');
  }
}
