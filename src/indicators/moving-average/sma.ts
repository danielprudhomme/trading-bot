import MovingAverage from './moving-average';
import { MovingAverageDirection } from './moving-average-direction';
import MovingAverageValue from './moving-average-value';

/* Simple Moving Average */
export default class SMA extends MovingAverage {
  calculateAtIndex(index: number) {
    if (index < this.length - 1) return;

    const sum = this.chart.candles.slice(index - this.length + 1, index + 1)
      .reduce((a, _, i) => a + this.source(i + index - this.length + 1), 0);

    const value = sum / this.length;
    const previousValue = this.chart.getIndicatorValueAtIndex(index - 1, this)?.value ?? 0;
    const direction: MovingAverageDirection = value >= previousValue ? 'up': 'down';
    
    this.chart.setIndicatorValueAtIndex(index, this, new MovingAverageValue(value, direction));
  }
}

