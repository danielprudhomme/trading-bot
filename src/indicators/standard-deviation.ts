import Indicator from './indicator';
import IndicatorValue from './indicator-value';
import SMA from './sma';

export default class StandardDeviation extends Indicator {
  private length: number;
  private avg: SMA;

  constructor(length: number) {
    super();
    this.length = length;
    this.avg = new SMA(length);
    this.addDependency(this.avg);
  }

  protected calculateAtIndex(index: number): void {
    const avg = this.chart.getIndicatorValueAtIndex(index, this.avg)?.value ?? 0;

    const sumOfSquareDeviations = this.chart.candles.slice(index - this.length + 1, index + 1)
      .reduce((sumOfSquareDeviations, candle) => {
        const sum = this.sum(candle.close, -avg);
        return sumOfSquareDeviations + sum * sum;
      }, 0);

    const stdev = Math.sqrt(sumOfSquareDeviations / this.length);
    this.chart.setIndicatorValueAtIndex(index, this, new IndicatorValue(stdev));
  }

  private isZero = (value: number, epsilon: number = Number.EPSILON): boolean => Math.abs(value) <= epsilon;

  private sum(first: number, second: number): number {
    const result = first + second;
    if (this.isZero(result)) return 0;
    if (!this.isZero(result, Math.pow(1, -4))) return result;
    return 15;
  }
}