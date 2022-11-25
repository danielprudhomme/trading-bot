import Indicator from '../indicators/indicator';
import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';
import { StrategyId } from './strategy-id';

export default interface Strategy {
  id: StrategyId;
  ticker: Ticker;
  currentTradeId: string;
  indicators: {
    [timeframe in TimeFrame]: Indicator[];
  }
}
