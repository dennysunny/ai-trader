export enum MessageType {
  CONNECT = 'cf',
  HEARTBEAT = 'h',
  MARKET_ACK = 'tk',
  MARKET_FEED = 'tf',
  DEPTH_ACK = 'dk',
  DEPTH_FEED = 'df',
}

enum BrokerState {
  DISCONNECTED,
  CONNECTING,
  AUTHENTICATING,
  CONNECTED,
  SUBSCRIBED,
  RECONNECTING,
  ERROR,
}
