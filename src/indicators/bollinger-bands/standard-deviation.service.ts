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

  calculate(chart: Chart): void {
    if (chart.candlesticks.length < this.length) this.setValue(chart, undefined);

    const avg = this.getIndicatorValue(chart, 0, this.avg);
    if (avg === undefined) throw new Error('SMA should be defined.');

    const sumOfSquareDeviations = chart.candlesticks.slice(0, this.length).reduce((sumOfSquareDeviations, candlestick) => {
      const sum = this.sum(candlestick.close, -avg.value);
      return sumOfSquareDeviations + sum * sum;
    }, 0);

    const stdev = Math.sqrt(sumOfSquareDeviations / this.length);
    this.setValue(chart, new IndicatorValue(stdev));
  }

  private isZero = (value: number, epsilon: number = Number.EPSILON): boolean => Math.abs(value) <= epsilon;

  private sum(first: number, second: number): number {
    const result = first + second;
    if (this.isZero(result)) return 0;
    if (!this.isZero(result, Math.pow(1, -4))) return result;
    return 15;
  }
}