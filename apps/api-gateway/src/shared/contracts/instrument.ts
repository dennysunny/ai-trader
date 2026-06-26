import { InstrumentType, OptionType } from '../shared-enums.enum';

export interface Instrument {
  exchange: string;
  symbol: string;
  instrumentType:
    | InstrumentType.INDEX
    | InstrumentType.EQUITY
    | InstrumentType.OPTION
    | InstrumentType.FUTURE;
  expiry?: string;
  strike?: number;
  optionType?: OptionType.CALL | OptionType.PUT;
}
