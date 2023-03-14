import Chart from '../../models/chart';
import Indicator, { IndicatorSource } from '../indicator';
import { rma, RsiRma } from '../rsi/rsi';

export interface Supertrend extends Indicator {
  factor: number;
  atr: RsiRma;
}

export const supertrend = (factor: number, atrPeriod: number, source?: IndicatorSource): Supertrend => ({
  type: 'supertrend',
  source: source ?? 'close',
  factor,
  atr: rma(atrPeriod, trueTrange),
});

export function trueTrange(chart: Chart, index: number): number {
  const candlestick = chart.candlesticks[index];
  const prevCandlestick = chart.candlesticks[index + 1];

  const high = candlestick?.high ?? 0;
  const low = candlestick?.low ?? 0;

  if (!prevCandlestick) {
    return high - low;
  }

  const prevClose = prevCandlestick.close;
  return Math.max(Math.max(high - low, Math.abs(high - prevClose)), Math.abs(low - prevClose));
}
