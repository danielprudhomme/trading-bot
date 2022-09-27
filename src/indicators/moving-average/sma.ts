import MovingAverage from './moving-average';
import { MovingAverageDirection } from './moving-average-direction';
import MovingAverageValue from './moving-average-value';

/* Simple Moving Average */
export default class SMA extends MovingAverage {
  protected calculateAtIndex(index: number): MovingAverageValue | null {
    if (index < this.length - 1) return null;

    const sum = this.chart.candlesticks.slice(index - this.length + 1, index + 1)
      .reduce((a, _, i) => a + this.source(i + index - this.length + 1), 0);

    const value = sum / this.length;
    const previousValue = this.getValue(index - 1)?.value ?? 0;
    const direction: MovingAverageDirection = value >= previousValue ? 'up': 'down';
    
    return new MovingAverageValue(value, direction);
  }
}

