import Chart from '../../models/chart';
import { IndicatorService } from '../indicator.service';
import { Ema } from './ema';
import { movingAverageDirection } from './moving-average-direction';
import MovingAverageValue from './moving-average-value';

/* Exponential Moving Average */
export default class EmaService extends IndicatorService {
  length: number;

  constructor(ema: Ema) {
    super(ema);
    this.length = ema.length;
  }
  
  calculate(chart: Chart, index: number): void {
    if (chart.candlesticks.length < this.length) throw new Error('Not enough candlesticks to calculate EMA.');

    if (index === chart.candlesticks.length - 1) {
      this.setValue(chart, index, undefined);
      return;
    }

    const alpha = 2 / (this.length + 1);
    const lastEma = this.getIndicatorValue(chart, index + 1)?.value ?? this.getSourceValue(chart, index + 1) ?? 0;
    const ema = alpha * (this.getSourceValue(chart, index) ?? 0) + (1 - alpha) * lastEma;
    const direction = movingAverageDirection(ema, lastEma);

    this.setValue(chart, index, new MovingAverageValue(ema, direction));
  }
}