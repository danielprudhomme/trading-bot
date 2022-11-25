import { IndicatorType } from './indicator-type';

export default interface Indicator {
  type: IndicatorType;
  source: 'close' | Indicator;
}