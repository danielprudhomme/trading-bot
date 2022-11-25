import { IndicatorSource } from '../indicator-source';
import IndicatorWithValue from '../indicator-with-value';
import EMA from '../moving-average/ema.service';
import MovingAverageValue from '../moving-average/moving-average-value';
import MacdZeroLagValue from './macd-zero-lag-value';

export default class MacdZeroLag extends IndicatorWithValue<MacdZeroLagValue> {
  private fastDema: Dema;
  private slowDema: Dema;
  private signal: Dema;
  
  constructor(fastLength: number = 12, slowLength: number = 26, signalLength: number = 9) {
    super();
    this.fastDema = new Dema(fastLength);
    this.addDependency(this.fastDema);
    this.slowDema = new Dema(slowLength);
    this.addDependency(this.slowDema);
    this.signal = new Dema(signalLength, (index: number) => this.getMacdZeroLagValue(index));
    this.addDependency(this.signal);
  }

  calculateAtIndex = (index: number): MacdZeroLagValue | null => new MacdZeroLagValue(
    this.getMacdZeroLagValue(index),
    this.chart.getIndicatorValueAtIndex(index, this.signal)?.value ?? 0
  );

  private getMacdZeroLagValue = (index: number): number =>
    (this.chart.getIndicatorValueAtIndex(index, this.fastDema)?.value ?? 0) - (this.chart.getIndicatorValueAtIndex(index, this.slowDema)?.value ?? 0);
}

class Dema extends EMA {
  private ema: EMA;
  private emaEma: EMA;

  constructor(length: number, source: IndicatorSource | null = null) {
    super(length, source);
    this.ema = new EMA(length, source);
    this.addDependency(this.ema);
    this.emaEma = new EMA(length, (index: number) => this.chart.getIndicatorValueAtIndex(index, this.ema)?.value ?? 0);
    this.addDependency(this.emaEma);
  }

  protected calculateAtIndex(index: number): MovingAverageValue | null {
    const ema = this.chart.getIndicatorValueAtIndex(index, this.ema)?.value ?? 0;
    const emaEma = this.chart.getIndicatorValueAtIndex(index, this.emaEma)?.value ?? 0;
    const value = 2 * ema - emaEma;

    return new MovingAverageValue(value);
  }
}
