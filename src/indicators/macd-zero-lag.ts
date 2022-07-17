import EMA from './ema';
import Indicator from './indicator';
import { IndicatorSource } from './indicator-source';
import IndicatorValue from './indicator-value';
import MacdZeroLagValue from './macd-zero-lag-value';

export default class MacdZeroLag extends Indicator {
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

  calculateAtIndex(index: number): void {
    const value = new MacdZeroLagValue(
      this.getMacdZeroLagValue(index),
      this.chart.getIndicatorValueAtIndex(index, this.signal)?.value ?? 0
    );

    this.chart.setIndicatorValueAtIndex(index, this, value);
  }

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

  calculateAtIndex(index: number) {
    const ema = this.chart.getIndicatorValueAtIndex(index, this.ema)?.value ?? 0;
    const emaEma = this.chart.getIndicatorValueAtIndex(index, this.emaEma)?.value ?? 0;
    const value = 2 * ema - emaEma;
    this.chart.setIndicatorValueAtIndex(index, this, new IndicatorValue(value));
  }
}
