export interface IBrokerSession {
  broker: 'ALICE_BLUE';
  userId: string;
  clientId: string;
  userSession: string;
  authenticatedAt: Date;
}

export interface IAliceBlueUserDetailsResponse {
  stat: string;
  clientId?: string;
  userSession?: string;
  emsg?: string;
}

/**
 * Interface representing a market message from Alice Blue.
 * This message contains various fields related to market data, such as token, exchange, symbol, and price information.
 * The fields are optional and may not be present in every message.
 * The 't' field indicates the type of the message, which can be either 'tk' (tick) or 'tf' (trade).
 * The 'ft' field represents the timestamp of the message in seconds since the epoch.
 * The 'oi' field represents the open interest, and the 'pc' field represents the previous close price.
 * All other fields represent various market data points, such as last traded price, open, high, low, close, and volume.
 */
export interface IAliceBlueMarketMessage {
  t: 'tk' | 'tf';
  e?: string;
  tk?: string;
  ts?: string;
  lp?: string;
  o?: string;
  h?: string;
  l?: string;
  c?: string;
  v?: string;
  ft?: string;
  oi?: string;
  pc?: string;
}
