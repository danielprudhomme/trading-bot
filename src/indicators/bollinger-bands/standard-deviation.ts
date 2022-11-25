import Indicator from '../indicator';
import { Sma, sma } from '../moving-average/sma';

export default interface StandardDeviation extends Indicator {
  length: number;
  avg: Sma;
}

export const stdev = (length: number, source?: Indicator): StandardDeviation => ({
  type: 'stdev',
  source: source ?? 'close',
  length,
  avg: sma(length, source),
});