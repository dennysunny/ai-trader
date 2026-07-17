import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { IBrokerSession } from '../../interfaces/broker-session.interface';
import { ChecksumService } from './checksum.service';
import { IAliceBlueUserDetailsResponse } from '../../interfaces/broker.interface';

@Injectable()
export class AliceBlueAuthService {
  private session: IBrokerSession | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly checksumService: ChecksumService,
  ) {}

  getLoginUrl(): string {
    const loginUrl = this.configService.getOrThrow<string>(
      'ALICE_BLUE_LOGIN_URL',
    );

    const appCode = this.configService.getOrThrow<string>(
      'ALICE_BLUE_APP_CODE',
    );

    return `${loginUrl}/?appcode=${encodeURIComponent(appCode)}`;
  }

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

  getSession(): IBrokerSession | null {
    return this.session;
  }
}
