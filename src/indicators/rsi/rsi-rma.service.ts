import Chart from '../../models/chart';
import Indicator from '../indicator';
import IndicatorValue from '../indicator-value';
import { IndicatorService } from '../indicator.service';
import { Sma } from '../moving-average/sma';
import { RsiRma } from './rsi';

export default class RsiRmaService extends IndicatorService {
  length: number;
  sma: Sma;

  constructor(rsiRma: RsiRma) {
    super(rsiRma);
    this.length = rsiRma.length;
    this.sma = rsiRma;
  }

  getDependencies = (): Indicator[] => [this.sma];
  
  calculate(chart: Chart): void {
    if (chart.candlesticks.length < this.length) this.setValue(chart, undefined);

    const alpha = 1 / this.length;

    const sourceValue = this.getSourceValue(chart) ?? 0;
    const smaValue = this.getIndicatorValue(chart, 0, this.sma)?.value;
    const previousRMAValue = this.getIndicatorValue(chart, 1)?.value;

    const value = previousRMAValue ?
      alpha * sourceValue + (1 - alpha) * previousRMAValue :
      smaValue ?? 0;
    
    this.setValue(chart, new IndicatorValue(value));
  }
}