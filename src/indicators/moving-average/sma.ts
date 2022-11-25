import Indicator from '../indicator';

export interface Sma extends Indicator {
  length: number;
}

export const sma = (length: number, source?: Indicator | 'close'): Sma => ({
  type: 'sma',
  source: source ?? 'close',
  length
});