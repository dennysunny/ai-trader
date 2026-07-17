import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import WebSocket from 'ws';

import { WebsocketTokenService } from './websocket-token.service';
import {
  WebsocketMessageType,
  WebsocketState,
} from '../../../config/broker/alice-blue/alice-blue-broker.enum';
import { AliceBlueAuthService } from '../../auth/alice-blue/alice-blue-auth.service';

/**
 * Service to manage WebSocket connections with Alice Blue.
 * It handles connection establishment, authentication, message handling, and heartbeat management.
 * The service maintains the state of the WebSocket connection and provides methods to connect, authenticate, and process incoming messages.
 * It also manages a heartbeat mechanism to keep the connection alive and detect disconnections.
 */
@Injectable()
export class AliceBlueWebsocketService {
  private readonly logger = new Logger(AliceBlueWebsocketService.name);
  private socket: WebSocket | null = null;
  private state: WebsocketState = WebsocketState.DISCONNECTED;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AliceBlueAuthService,
    private readonly tokenService: WebsocketTokenService,
  ) {}

  /**
   * Method to initiate a WebSocket connection to Alice Blue.
   * It checks for an existing authenticated session and the current state of the WebSocket.
   * If the WebSocket is already connected or in the process of connecting/authenticating, it logs a warning and returns.
   * Otherwise, it establishes a new WebSocket connection and registers event handlers for open, message, close, and error events.
   */
  connect(): void {
    const session = this.authService.getSession();

    if (!session) {
      throw new Error(
        'Alice Blue authentication required before WebSocket connection',
      );
    }

    if (
      this.state === WebsocketState.CONNECTING ||
      this.state === WebsocketState.AUTHENTICATING ||
      this.state === WebsocketState.CONNECTED
    ) {
      this.logger.warn(`WebSocket already in state: ${this.state}`);
      return;
    }

    const wsUrl = this.configService.getOrThrow<string>('ALICE_BLUE_WS_URL');

    this.state = WebsocketState.CONNECTING;
    this.logger.log('Connecting to Alice Blue WebSocket...');

    this.socket = new WebSocket(wsUrl);
    this.registerHandlers();
  }

  /**
   * Method to disconnect the WebSocket connection from Alice Blue.
   * It stops the heartbeat mechanism and closes the WebSocket connection if it is open.
   * The state of the WebSocket is updated to DISCONNECTED.
   * If the WebSocket is already disconnected, it does not perform any action.
   */
  disconnect(): void {
    this.stopHeartbeat();

    if (this.socket) {
      this.socket.close();

      this.socket = null;
    }

    this.state = WebsocketState.DISCONNECTED;
  }

  /**
   * Method to retrieve the current state of the WebSocket connection.
   * @returns {WebsocketState} - The current state of the WebSocket connection (DISCONNECTED, CONNECTING, AUTHENTICATING, CONNECTED, ERROR).
   */
  getState(): WebsocketState {
    return this.state;
  }

  /**
   * Method to register event handlers for the WebSocket connection.
   * It handles the 'open', 'message', 'close', and 'error' events.
   * On 'open', it initiates authentication.
   * On 'message', it processes incoming messages.
   * On 'close', it logs the disconnection and updates the state.
   * On 'error', it logs the error and updates the state.
   */
  private registerHandlers(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on('open', () => {
      this.logger.log('WebSocket transport connected');
      this.authenticate();
    });

    this.socket.on('message', (data: WebSocket.RawData) => {
      this.handleMessage(data.toString());
    });

    this.socket.on('close', () => {
      this.logger.warn('Alice Blue WebSocket disconnected');
      this.state = WebsocketState.DISCONNECTED;
      this.stopHeartbeat();
    });

    this.socket.on('error', (error) => {
      this.logger.error('Alice Blue WebSocket error', error);
      this.state = WebsocketState.ERROR;
    });
  }

  /**
   * Method to authenticate the WebSocket connection with Alice Blue.
   * It retrieves the current authenticated session and generates a user token.
   * It then sends an authentication request to the WebSocket server.
   * If the session is not available or the socket is not initialized, it returns without performing any action.
   */
  private authenticate(): void {
    const session = this.authService.getSession();

    if (!session || !this.socket) {
      return;
    }

    this.state = WebsocketState.AUTHENTICATING;

    const sUserToken = this.tokenService.generate(session.userSession);
    const connectionRequest = {
      susertoken: sUserToken,
      t: 'c',
      actid: `${session.clientId}_API`,
      uid: `${session.clientId}_API`,
      source: 'API',
    };

    this.logger.log('Authenticating Alice Blue WebSocket...');
    this.socket.send(JSON.stringify(connectionRequest));
  }

  /**
   * Method to handle incoming WebSocket messages from Alice Blue.
   * It parses the raw message and processes it based on its type.
   * Different message types trigger different actions, such as handling connection acknowledgements, market ticks, and depth updates.
   * If the message cannot be parsed, it logs an error.
   * @param rawMessage - The raw message received from the WebSocket connection.
   */
  private handleMessage(rawMessage: string): void {
    try {
      const message = JSON.parse(rawMessage);

      switch (message.t) {
        case WebsocketMessageType.CONNECTION_ACK:
          this.handleConnectionAck(message);
          break;

        case WebsocketMessageType.MARKET_SUBSCRIPTION_ACK:
          this.logger.debug('Market subscription acknowledgement received');
          break;

        case WebsocketMessageType.MARKET_TICK:
          this.logger.debug(`Market tick received for token ${message.tk}`);
          break;

        case WebsocketMessageType.DEPTH_SUBSCRIPTION_ACK:
          this.logger.debug('Depth subscription acknowledgement received');
          break;

        case WebsocketMessageType.DEPTH_UPDATE:
          this.logger.debug(`Depth update received for token ${message.tk}`);
          break;

        default:
          this.logger.debug(`Unknown Alice Blue message type: ${message.t}`);
      }
    } catch {
      this.logger.error('Unable to parse Alice Blue WebSocket message');
    }
  }

  /**
   * Method to handle connection acknowledgement messages from Alice Blue.
   * It checks the status of the acknowledgement and updates the WebSocket state accordingly.
   * If the acknowledgement indicates a successful connection, it starts the heartbeat mechanism.
   * If the acknowledgement indicates an error, it logs the error and updates the state to ERROR.
   * @param message - The connection acknowledgement message received from the WebSocket connection.
   */
  private handleConnectionAck(message: any): void {
    if (message.k === 'OK') {
      this.state = WebsocketState.CONNECTED;

      this.logger.log('Alice Blue WebSocket authenticated successfully');

      this.startHeartbeat();

      return;
    }

    this.state = WebsocketState.ERROR;
    this.logger.error(
      `Alice Blue WebSocket authentication failed: ${message.k}`,
    );
  }

  /**
   * Method to start the heartbeat mechanism for the WebSocket connection.
   * It sets up a timer that sends a heartbeat message to the WebSocket server every 50 seconds.
   * If the WebSocket is not open, it does not send the heartbeat.
   * The heartbeat helps to keep the connection alive and detect any disconnections.
   * If a heartbeat timer is already running, it stops the existing timer before starting a new one.
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            k: '',
            t: 'h',
          }),
        );

        this.logger.debug('Alice Blue heartbeat sent');
      }
    }, 50_000);
  }

  /**
   * Method to stop the heartbeat mechanism for the WebSocket connection.
   * It clears the existing heartbeat timer if it is running and sets the timer reference to null.
   * This method is called when the WebSocket connection is closed or when a new heartbeat timer needs to be started.
   * It ensures that only one heartbeat timer is active at any given time.
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}
