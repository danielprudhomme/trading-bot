import Indicator, { IndicatorSource } from '../indicator';

export interface Ema extends Indicator {
  length: number;
}

export const ema = (length: number, source?: IndicatorSource): Ema => ({
  type: 'ema',
  source: source ?? 'close',
  length
});