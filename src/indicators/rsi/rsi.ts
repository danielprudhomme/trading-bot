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
  upRma: rma(length, sma(length, up(source)), source),
  downRma: rma(length, sma(length, down(source)), source),
});

const up = (source?: Indicator): RsiUp => ({
  type: 'rsiUp',
  source: source ?? 'close'
});

const down = (source?: Indicator): RsiDown => ({
  type: 'rsiDown',
  source: source ?? 'close'
});

const rma = (length: number, sma: Sma, source?: Indicator): RsiRma => ({
  type: 'rsiRma',
  source: source ?? 'close',
  length,
  sma,
})