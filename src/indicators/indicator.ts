import Chart from '../models/chart';
import { IndicatorType } from './indicator-type';

export type IndicatorSource = 'close' | Indicator | ((chart: Chart, index: number) => number);

export default interface Indicator {
  type: IndicatorType;
  source: IndicatorSource;
}

export function sourceIsIndicator(source: IndicatorSource): source is Indicator {
  return !(source === 'close') && 'type' in source;
}