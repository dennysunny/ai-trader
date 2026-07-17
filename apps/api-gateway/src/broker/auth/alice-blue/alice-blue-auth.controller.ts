import { Body, Controller, Get, Post } from '@nestjs/common';

import { AliceBlueAuthService } from './alice-blue-auth.service';
import { AliceBlueCallbackDto } from '../../dto/alice-blue-callback.dto';

/**
 * AliceBlueAuthController is a controller that handles authentication requests for the Alice Blue broker.
 * Controller Methods:
 * - getLoginUrl: Returns the login URL for Alice Blue authentication.
 * - authenticate: Handles the callback from Alice Blue after user authentication and returns session details.
 * - getStatus: Returns the current authentication status and session details if authenticated.
 */
@Controller('broker/alice-blue/auth')
export class AliceBlueAuthController {
  constructor(private readonly authService: AliceBlueAuthService) {}

  @Get('login')
  getLoginUrl() {
    return {
      loginUrl: this.authService.getLoginUrl(),
    };
  }

  @Post('callback')
  async authenticate(@Body() dto: AliceBlueCallbackDto) {
    const session = await this.authService.authenticate(
      dto.userId,
      dto.authCode,
    );

    return {
      authenticated: true,
      broker: session.broker,
      userId: session.userId,
      clientId: session.clientId,
    };
  }

  @Get('status')
  getStatus() {
    const session = this.authService.getSession();

    return {
      authenticated: !!session,
      broker: 'ALICE_BLUE',
      userId: session?.userId ?? null,
      clientId: session?.clientId ?? null,
      authenticatedAt: session?.authenticatedAt ?? null,
    };
  }
}
