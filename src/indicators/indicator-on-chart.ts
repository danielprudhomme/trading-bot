import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';
import Indicator from './indicator';

export default interface IndicatorOnChart {
  indicator: Indicator;
  timeframe: TimeFrame;
  ticker: Ticker;
}