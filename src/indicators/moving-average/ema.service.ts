import Chart from '../../models/chart';
import { IndicatorService } from '../indicator.service';
import { Ema } from './ema';
import MovingAverageValue from './moving-average-value';

/* Exponential Moving Average */
export default class EmaService extends IndicatorService {
  length: number;

  constructor(ema: Ema) {
    super(ema);
    this.length = ema.length;
  }
  
  calculate(chart: Chart): void {
    const alpha = 2 / (this.length + 1);

    if (chart.candlesticks.length === 1) {
      this.setValue(chart, new MovingAverageValue(this.getSourceValue(chart) ?? 0, 'up'));
      return;
    }

    const lastEma = this.getIndicatorValue(chart, 1)?.value ?? 0;
    const ema = alpha * (this.getSourceValue(chart) ?? 0) + (1 - alpha) * lastEma;
    const direction = ema >= lastEma ? 'up' : 'down';

    this.setValue(chart, new MovingAverageValue(ema, direction));
  }
}