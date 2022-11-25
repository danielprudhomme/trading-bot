import Indicator from '../indicators/indicator';
import { StrategyId } from '../strategies/strategy-id';
import Ticker from './ticker';

export default interface Strategy {
  id: StrategyId;
  ticker: Ticker;
  currentTradeId: string;
  indicators: Indicator[];
}
