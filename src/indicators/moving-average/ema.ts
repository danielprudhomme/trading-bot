import Indicator from '../indicator';

export interface Ema extends Indicator {
  length: number;
}

export const ema = (length: number, source?: Indicator | 'close'): Ema => ({
  type: 'ema',
  source: source ?? 'close',
  length
});