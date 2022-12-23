import Indicator from '../indicator';
import { Sma, sma } from '../moving-average/sma';
import StandardDeviation, { stdev } from './standard-deviation';

export default interface BollingerBands extends Indicator {
  length: number;
  mult: number;
  basis: Sma;
  stdev: StandardDeviation;
}

export const bb = (length: number, mult: number, source?: Indicator): BollingerBands => ({
  type: 'bb',
  source: source ?? 'close',
  length,
  mult,
  basis: sma(length, source),
  stdev: stdev(length, source),
});