import Indicator from '../indicator';
import { Sma, sma } from '../moving-average/sma';

export interface Rsi extends Indicator {
  length: number;
  upRma: RsiRma;
  downRma: RsiRma;
}

export interface RsiUp extends Indicator {}
export interface RsiDown extends Indicator {}

export interface RsiRma extends Indicator {
  length: number;
  sma: Sma;
}

export const rsi = (length: number, source?: Indicator): Rsi => ({
  type: 'rsi',
  source: source ?? 'close',
  length,
  upRma: rma(length, up(source)),
  downRma: rma(length, down(source)),
});

export const up = (source?: Indicator): RsiUp => ({
  type: 'rsiUp',
  source: source ?? 'close'
});

export const down = (source?: Indicator): RsiDown => ({
  type: 'rsiDown',
  source: source ?? 'close'
});

export const rma = (length: number, source?: Indicator): RsiRma => ({
  type: 'rsiRma',
  source: source ?? 'close',
  length,
  sma: sma(length, source),
});