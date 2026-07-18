import { IMarketTick } from '../../market/interfaces/market-tick.interface';

export interface IBroker {
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  subscribe(tokens: string[]): Promise<void>;
  unsubscribe(tokens: string[]): Promise<void>;

  onTick(callback: (tick: IMarketTick) => void): void;
}
