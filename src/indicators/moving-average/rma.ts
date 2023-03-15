import Indicator, { IndicatorSource } from '../indicator';
import { sma, Sma } from './sma';

export interface Rma extends Indicator {
  length: number;
  sma: Sma;
}

export const rma = (length: number, source?: IndicatorSource): Rma => ({
  type: 'rma',
  source: source ?? 'close',
  length,
  sma: sma(length, source ?? 'close'),
});