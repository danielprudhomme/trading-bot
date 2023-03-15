import Chart from '../../models/chart';
import Indicator from '../indicator';
import IndicatorValue from '../indicator-value';
import { IndicatorService } from '../indicator.service';
import { Rma } from './rma';
import { Sma } from './sma';

export default class RmaService extends IndicatorService {
  length: number;
  sma: Sma;

  constructor(rma: Rma) {
    super(rma);
    this.length = rma.length;
    this.sma = rma.sma;
  }

  getDependencies = (): Indicator[] => [this.sma];
  
  calculate(chart: Chart, index: number): void {
    if (chart.candlesticks.length < this.length) throw new Error('Not enough candlesticks to calculate RMA.');

    const alpha = 1 / this.length;

    const sourceValue = this.getSourceValue(chart, index) ?? 0;
    const smaValue = this.getIndicatorValue(chart, index, this.sma)?.value ?? 0;
    const previousRMAValue = this.getIndicatorValue(chart, index + 1)?.value;

    const value = previousRMAValue ?
      alpha * sourceValue + (1 - alpha) * previousRMAValue :
      smaValue;
    
    this.setValue(chart, index, new IndicatorValue(value));
  }
}