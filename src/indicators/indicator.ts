import Chart from '../models/chart';
import { IndicatorType } from './indicator-type';

export default interface Indicator {
  type: IndicatorType;
  source: 'close' | Indicator | ((chart: Chart, index: number) => number);
}

export function sourceIsIndicator(source: 'close' | Indicator | ((chart: Chart, index: number) => number)): source is Indicator {
  return !(source === 'close') && 'type' in source;
}