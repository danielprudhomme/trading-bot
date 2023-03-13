import Indicator, { IndicatorSource } from '../indicator';

export interface Sma extends Indicator {
  length: number;
}

export const sma = (length: number, source?: IndicatorSource): Sma => ({
  type: 'sma',
  source: source ?? 'close',
  length
});