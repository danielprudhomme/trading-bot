import MovingAverage from "./moving-average";
import { MovingAverageDirection } from "./moving-average-direction";
import MovingAverageValue from "./moving-average-value";

/* Exponential Moving Average */
export default class EMA extends MovingAverage {
  calculateAtIndex(index: number) {
    const alpha = 2 / (this.length + 1);
    const candle = this.chart.getCandleAtIndex(index);

    let ema = this.source(index);
    let direction: MovingAverageDirection = 'up';
    if (index > 0) {
      const lastEma = this.chart.getIndicatorValueAtIndex(index - 1, this)?.value ?? 0;
      ema = alpha * this.source(index) + (1 - alpha) * lastEma;
      direction = ema >= lastEma ? 'up' : 'down';
    }

    candle.setIndicatorValue(this, new MovingAverageValue(ema, direction));
  }
}