import Indicator from './indicator';
import { IndicatorSource } from './indicator-source';
import IndicatorValue from './indicator-value';

/* Exponential Moving Average */
export default class EMA extends Indicator {
  length: number;

  constructor(length: number, source: IndicatorSource | null = null) {
    super(source);
    this.length = length;
  }
  
  calculateAtIndex(index: number) {
    const alpha = 2 / (this.length + 1);
    const candle = this.chart.getCandleAtIndex(index);
    let ema = this.source(index);
    if (index > 0) {
      const lastEma = this.chart.getIndicatorValueAtIndex(index - 1, this)?.value ?? 0;
      ema = alpha * this.source(index) + (1 - alpha) * lastEma;
    }
    candle.setIndicatorValue(this, new IndicatorValue(ema));
  }
}