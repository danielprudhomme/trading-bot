import Indicator from '../indicators/indicator';
import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';
import { StrategyType } from './strategy-type';

export default interface Strategy {
  id: string;
  type: StrategyType;
  ticker: Ticker;
  currentTradeId: string | null;
  indicators: { indicator: Indicator, timeframe: TimeFrame }[];
  updated?: boolean;
}
