import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import WebSocket from 'ws';

import {
  WebsocketMessageType,
  WebsocketState,
} from '../../../config/broker/alice-blue/alice-blue-broker.enum';
import { IMarketTick } from '../../../market/interfaces/market-tick.interface';
import { AliceBlueAuthService } from '../../auth/alice-blue/alice-blue-auth.service';
import { WebsocketTokenService } from './websocket-token.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AliceBlueMarketMapper } from '../../mappers/alice-blue/alice-blue-market.mapper';
import { MarketTickReceivedEvent } from '../../../market/events/market-tick-received.event';
import { IAliceBlueMarketMessage } from '../../interfaces/alice-blue/alice-blue-broker.interface';

/**
 * Service to manage WebSocket connections with Alice Blue.
 * It handles connection establishment, authentication, message handling, and heartbeat management.
 * The service maintains the state of the WebSocket connection and provides methods to connect, authenticate, and process incoming messages.
 * It also manages a heartbeat mechanism to keep the connection alive and detect disconnections.
 */
@Injectable()
export class AliceBlueWebsocketService {
  /** Logger instance for the service. */
  private readonly logger = new Logger(AliceBlueWebsocketService.name);

  /** WebSocket instance for the service. */
  private socket: WebSocket | null = null;

  /** Current state of the WebSocket connection. */
  private state: WebsocketState = WebsocketState.DISCONNECTED;

  /** Timer for managing heartbeat messages. */
  private heartbeatTimer: NodeJS.Timeout | null = null;

  /** Map to store the latest market tick data for each instrument. */
  private readonly marketState = new Map<string, IMarketTick>();

  /** Map to store the exchange for each token. */
  private readonly tokenExchangeMap = new Map<string, string>();

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AliceBlueAuthService,
    private readonly tokenService: WebsocketTokenService,
    private readonly mapper: AliceBlueMarketMapper,
    private readonly eventEmitter: EventEmitter2,
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
          this.handleMarketMessage(message);
          break;

        case WebsocketMessageType.MARKET_TICK:
          this.logger.debug(`Market tick received for token ${message.tk}`);
          this.handleMarketMessage(message);
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
   * Method to handle market messages from Alice Blue.
   * It processes market subscription acknowledgements and market tick messages.
   * For market subscription acknowledgements, it updates the token-exchange mapping.
   * For market tick messages, it maps the message to an IMarketTick object and emits a MarketTickReceivedEvent.
   * If a market tick message does not contain a token, it ignores the message.
   * @param message - The market message received from the WebSocket connection.
   */
  private handleMarketMessage(message: IAliceBlueMarketMessage): void {
    if (!message.tk && message.t === WebsocketMessageType.MARKET_TICK) {
      return;
    }

    if (
      message.t === WebsocketMessageType.MARKET_SUBSCRIPTION_ACK &&
      message.tk &&
      message.e
    ) {
      this.tokenExchangeMap.set(message.tk, message.e);
    }

    const exchange =
      message.e ?? this.tokenExchangeMap.get(message.tk ?? '') ?? '';
    const token = message.tk ?? '';
    const key = `${exchange}:${token}`;
    const previous = this.marketState.get(key);
    const tick = this.mapper.map(message, previous);

    /*
     * A tf message may not contain exchange or symbol.
     * If necessary, find the previous token state.
     */

    this.marketState.set(key, tick);

    this.eventEmitter.emit(
      'market.tick.received',
      new MarketTickReceivedEvent(tick),
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

  /**
   * Method to subscribe to market data for a list of instruments.
   * It checks if the WebSocket is connected and open before sending the subscription request.
   * The instruments are formatted into a string of keys, which is sent to the WebSocket server as a subscription request.
   * If the WebSocket is not connected or open, it throws an error.
   * @param instruments - An array of instruments to subscribe to, each containing an exchange and a token.
   */
  subscribeMarketData(
    instruments: {
      exchange: string;
      token: string;
    }[],
  ): void {
    if (this.state !== WebsocketState.CONNECTED) {
      throw new Error('WebSocket must be connected before subscribing');
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket connection is not open');
    }

    const keys = instruments
      .map((instrument) => `${instrument.exchange}|${instrument.token}`)
      .join('#');

    const request = {
      k: keys,
      t: 't',
    };

    this.socket.send(JSON.stringify(request));

    this.logger.log(`Market subscription sent: ${keys}`);
  }

  /**
   * Method to unsubscribe from market data for a list of instruments.
   * It checks if the WebSocket is connected and open before sending the unsubscription request.
   * The instruments are formatted into a string of keys, which is sent to the WebSocket server as an unsubscription request.
   * If the WebSocket is not connected or open, it does not perform any action.
   * @param instruments - An array of instruments to unsubscribe from, each containing an exchange and a token.
   */
  unsubscribeMarketData(
    instruments: {
      exchange: string;
      token: string;
    }[],
  ): void {
    if (!this.socket) {
      return;
    }

    const keys = instruments
      .map((instrument) => `${instrument.exchange}|${instrument.token}`)
      .join('#');

    this.socket.send(
      JSON.stringify({
        k: keys,
        t: 'u',
      }),
    );

    this.logger.log(`Market unsubscribe sent: ${keys}`);
  }
}
