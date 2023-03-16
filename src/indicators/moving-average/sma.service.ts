import Chart from '../../models/chart';
import { Direction } from '../direction';
import { IndicatorService } from '../indicator.service';
import MovingAverageValue from './moving-average-value';
import { Sma } from './sma';

/* Simple Moving Average */
export default class SmaService extends IndicatorService {
  length: number;

  constructor(sma: Sma) {
    super(sma);
    this.length = sma.length;
  }
  
  calculate(chart: Chart, index: number): void {
    if (chart.candlesticks.length < this.length) throw new Error('Not enough candlesticks to calculate SMA.');

    if (index + this.length > chart.candlesticks.length - 1) {
      this.setValue(chart, index, undefined);
      return;
    }
    
    const sum = chart.candlesticks.slice(index, index + this.length)
      .reduce((partialSum, candlestick, i) => {
        const value = this.getSourceValue(chart, index + i) ?? 0;
        return partialSum + value;
      }, 0);

    const value = sum / this.length;
    const previousValue = this.getIndicatorValue(chart, index + 1)?.value ?? 0;
    const direction: Direction = value >= previousValue ? 'up': 'down';
    
    this.setValue(chart, index, new MovingAverageValue(value, direction));
  }
}