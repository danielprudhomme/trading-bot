import TickerHelper from '../helpers/ticker.helper';
import { bb } from '../indicators/bollinger-bands/bollinger-bands';
import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';
import Strategy from './strategy';

export default interface LowOutsideBBStrategy extends Strategy {
}

const type = 'low-outside-bb';
export const lowOutsideBBStrategy = (ticker: Ticker, timeframe: TimeFrame): LowOutsideBBStrategy => ({
  id: `${type}::${TickerHelper.toString(ticker)}::${timeframe}`,
  type,
  ticker,
  currentTradeId: null,
  indicators: [
    { indicator: bb(20, 2.5), timeframe }
  ]
});