import Chart from '../../models/chart';
import { IndicatorService } from '../indicator.service';
import { MovingAverageDirection } from './moving-average-direction';
import MovingAverageValue from './moving-average-value';
import { Sma } from './sma';

/* Simple Moving Average */
export default class SmaService extends IndicatorService {
  length: number;

  constructor(sma: Sma) {
    super(sma);
    this.length = sma.length;
  }
  
  calculate(chart: Chart): void {
    if (chart.candlesticks.length < this.length) this.setValue(chart, null);
    
    const sum = chart.candlesticks.slice(0, this.length)
      .reduce((partialSum, candlestick) => {
        const value = this.getCandlestickSourceValue(candlestick) ?? 0;
        return partialSum + value;
      }, 0);

    const value = sum / this.length;
    const previousValue = this.getIndicatorValue(chart, 1) ?? 0;
    const direction: MovingAverageDirection = value >= previousValue ? 'up': 'down';
    
    this.setValue(chart, new MovingAverageValue(value, direction));
  }
}

