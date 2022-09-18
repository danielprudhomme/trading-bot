import MovingAverage from './moving-average';
import { MovingAverageDirection } from './moving-average-direction';
import MovingAverageValue from './moving-average-value';

/* Exponential Moving Average */
export default class EMA extends MovingAverage {
  protected calculateAtIndex(index: number): MovingAverageValue | null {
    const alpha = 2 / (this.length + 1);

    let ema = this.source(index);
    let direction: MovingAverageDirection = 'up';
    if (index > 0) {
      const lastEma = this.getValue(index - 1)?.value ?? 0;
      ema = alpha * this.source(index) + (1 - alpha) * lastEma;
      direction = ema >= lastEma ? 'up' : 'down';
    }

    return new MovingAverageValue(ema, direction);
  }
}