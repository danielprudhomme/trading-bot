import ExponentialSMA from './ema';

export interface MacdZeroLagValues {
  macdZeroLag: number[];
  signal: number[];
  macdAboveSignal: boolean[];
}

export class MacdZeroLag {
  // Calculate EMA for the last value of the array values
  static calculate(values: number[], fastLength: number = 12, slowLength: number = 26, signalLength: number = 9): MacdZeroLagValues {
    const fastDema = this.dema(values, fastLength);
    const slowDema = this.dema(values, slowLength);
    const macdZeroLag = values.map((_, i) => fastDema[i] - slowDema[i]);
    const signal = this.dema(macdZeroLag, signalLength);
    
    return {
      macdZeroLag,
      signal,
      macdAboveSignal: macdZeroLag.map((x, i) => x > signal[i])
    }
  }

  private static dema(values: number[], length: number) {
    const ema = ExponentialSMA.calculate(values, length);
    const emaEma = ExponentialSMA.calculate(ema, length);
    return values.map((_, i) => 2 * ema[i] - emaEma[i]);
  }
}