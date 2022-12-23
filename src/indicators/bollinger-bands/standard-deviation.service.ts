import Chart from '../../models/chart';
import Indicator from '../indicator';
import IndicatorValue from '../indicator-value';
import { IndicatorService } from '../indicator.service';
import { Sma } from '../moving-average/sma';
import StandardDeviation from './standard-deviation';

export default class StandardDeviationService extends IndicatorService {
  length: number;
  avg: Sma;

  constructor(stdev: StandardDeviation) {
    super(stdev);
    
    this.length = stdev.length;
    this.avg = stdev.avg;
  }

  getDependencies = (): Indicator[] => [this.avg];

  calculateAtIndex(chart: Chart, index: number): void {
    if (chart.candlesticks.length < this.length) throw new Error('Not enough candlesticks to calculate Standard Deviation.');

    const avg = this.getIndicatorValue(chart, index, this.avg)?.value ?? 0;

    const sumOfSquareDeviations = chart.candlesticks.slice(index, index + this.length).reduce((sumOfSquareDeviations, candlestick) => {
      const sum = this.sum(candlestick.close, -avg);
      return sumOfSquareDeviations + sum * sum;
    }, 0);

    const stdev = Math.sqrt(sumOfSquareDeviations / this.length);
    
    this.setValue(chart, index, new IndicatorValue(stdev));
  }

  private isZero = (value: number, epsilon: number = Number.EPSILON): boolean => Math.abs(value) <= epsilon;

  private sum(first: number, second: number): number {
    const result = first + second;
    if (this.isZero(result)) return 0;
    if (!this.isZero(result, Math.pow(1, -4))) return result;
    return 15;
  }
}