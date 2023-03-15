import Chart from '../../models/chart';
import Indicator, { IndicatorSource } from '../indicator';
import { rma, Rma } from '../moving-average/rma';

export interface Rsi extends Indicator {
  length: number;
  upRma: Rma;
  downRma: Rma;
}

export const rsi = (length: number, source?: IndicatorSource): Rsi => ({
  type: 'rsi',
  source: source ?? 'close',
  length,
  upRma: rma(length, up),
  downRma: rma(length, down),
});

export function up(chart: Chart, index: number): number {
  const close = chart.candlesticks[index]?.close;
  const prevClose = chart.candlesticks[index + 1]?.close;

  return close && prevClose ? Math.max(close - prevClose, 0) : 0;
}

export function down(chart: Chart, index: number): number {
  const close = chart.candlesticks[index]?.close;
  const prevClose = chart.candlesticks[index + 1]?.close;

  return close && prevClose ? Math.max(prevClose - close, 0) : 0;
}