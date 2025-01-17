import Indicator from '../indicators/indicator';
import { TimeFrame } from '../timeframe/timeframe';
import Candlestick from './candlestick';
import Ticker from './ticker';

export default interface Chart {
  id: string;
  ticker: Ticker;
  timeframe: TimeFrame;
  indicators: Indicator[];
  candlesticks: Candlestick[]; // order by date : 0 is the most recent
}