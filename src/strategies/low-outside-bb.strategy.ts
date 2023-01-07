import { bb } from '../indicators/bollinger-bands/bollinger-bands';
import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';
import Strategy from './strategy';

export default interface LowOutsideBBStrategy extends Strategy {
}

export const lowOutsideBBStrategy = (ticker: Ticker, timeframe: TimeFrame): LowOutsideBBStrategy => ({
  type: 'low-outside-bb',
  ticker,
  currentTradeId: null,
  indicators: [
    { indicator: bb(20, 2.5), timeframe }
  ]
});