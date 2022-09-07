import Indicator from './indicator';
import { IndicatorSource } from './indicator-source';
import IndicatorValue from './indicator-value';

/* Simple Moving Average */
export default class SMA extends Indicator {
  protected length: number;

  constructor(length: number, source: IndicatorSource | null = null) {
    super(source);
    this.length = length;
  }

  calculateAtIndex(index: number) {
    if (index < this.length - 1) return;

    const sum = this.chart.candles.slice(index - this.length + 1, index + 1)
      .reduce((a, _, i) => a + this.source(i + index - this.length + 1), 0);
    const avg = new IndicatorValue(sum / this.length);
    this.chart.setIndicatorValueAtIndex(index, this, avg);
  }
}

