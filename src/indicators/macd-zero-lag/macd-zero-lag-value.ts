import IndicatorValue from '../indicator-value';

export default class MacdZeroLagValue extends IndicatorValue {
  macdZeroLag: number;
  signal: number;
  get macdAboveSignal(): boolean {
    return this.macdZeroLag > this.signal;
  }

  constructor(macdZeroLag: number, signal: number) {
    super(macdZeroLag);
    this.macdZeroLag = macdZeroLag;
    this.signal = signal;
  }

  toString = () => `Value: ${this.macdZeroLag}\tSignal: ${this.signal}\tAbove: ${this.macdAboveSignal}`;
}