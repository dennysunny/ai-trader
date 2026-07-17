import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import {
  IAliceBlueUserDetailsResponse,
  IBrokerSession,
} from '../../interfaces/alice-blue/alice-blue-broker.interface';
import { ChecksumService } from './checksum.service';

/**
 * AliceBlueAuthService is a service that handles authentication with the Alice Blue broker.
 * It provides methods to get the login URL, authenticate a user, and retrieve the current session.
 * It uses the ChecksumService to generate a checksum for authentication requests.
 */
@Injectable()
export class AliceBlueAuthService {
  private session: IBrokerSession | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly checksumService: ChecksumService,
  ) {}

  /**
   * Method to get the login URL for Alice Blue authentication.
   * It constructs the URL using the login URL and app code from the environment variables.
   * @returns {string} - The constructed login URL for Alice Blue authentication
   */
  getLoginUrl(): string {
    const loginUrl = this.configService.getOrThrow<string>(
      'ALICE_BLUE_LOGIN_URL',
    );

    const appCode = this.configService.getOrThrow<string>(
      'ALICE_BLUE_APP_CODE',
    );

    return `${loginUrl}/?appcode=${encodeURIComponent(appCode)}`;
  }

  /**
   * Method to authenticate a user with Alice Blue using the provided userId and authCode.
   * It generates a checksum and sends a POST request to the Alice Blue API to retrieve user details.
   * If successful, it stores the session details and returns them.
   * @param userId - The user ID provided by Alice Blue during the authentication process
   * @param authCode -  The authentication code provided by Alice Blue during the authentication process
   * @returns - A promise that resolves to the authenticated session details (IBrokerSession)
   * @throws - UnauthorizedException if authentication fails, BadGatewayException if unable to communicate with Alice Blue
   */
  async authenticate(
    userId: string,
    authCode: string,
  ): Promise<IBrokerSession> {
    const checksum = this.checksumService.generate(userId, authCode);

    const apiUrl = this.configService.getOrThrow<string>('ALICE_BLUE_API_URL');

    try {
      const response = await firstValueFrom(
        this.httpService.post<IAliceBlueUserDetailsResponse>(
          `${apiUrl}/vendor/getUserDetails`,
          {
            checkSum: checksum,
          },
        ),
      );

      const data = response.data;

      if (data.stat !== 'Ok' || !data.clientId || !data.userSession) {
        throw new UnauthorizedException(
          data.emsg ?? 'Alice Blue authentication failed',
        );
      }

      this.session = {
        broker: 'ALICE_BLUE',
        userId,
        clientId: data.clientId,
        userSession: data.userSession,
        authenticatedAt: new Date(),
      };

      return this.session;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new BadGatewayException('Unable to communicate with Alice Blue');
    }
  }

  /**
   * Method to get the current authenticated session.
   * @returns {IBrokerSession | null} - The current authenticated session or null if not authenticated
   */
  getSession(): IBrokerSession | null {
    return this.session;
  }
}
