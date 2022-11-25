import TimeFrame from '../enums/timeframe';
import { IndicatorType } from './indicator-type';

export default interface Indicator {
  type: IndicatorType;
  timeframe: TimeFrame;
  source: 'close' | Indicator;
}