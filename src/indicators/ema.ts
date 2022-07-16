import Indicator from './indicator';

/* Exponential Moving Average */
export default class EMA extends Indicator {
  length: number;

  constructor(length: number) {
    super();
    this.length = length;
  }
  
  calculateAtIndex(index: number) {
    if (!this.chart) return;
    
    const alpha = 2 / (this.length + 1);
    const candle = this.chart.getCandleAtIndex(index);
    let ema = candle.close;
    if (index > 0) {
      const lastEma = this.chart.getIndicatorValueAtIndex(index - 1, this) ?? 0;
      ema = alpha * candle.close + (1 - alpha) * lastEma;
    }
    candle.setIndicatorValue(this, ema);
  }
}