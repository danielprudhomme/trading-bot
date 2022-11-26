import Chart from '../../models/chart';
import Indicator from '../indicator';
import { IndicatorService } from '../indicator.service';
import { Ema } from '../moving-average/ema';
import MovingAverageValue from '../moving-average/moving-average-value';
import Dema from './dema';

export default class DemaService extends IndicatorService {
  ema: Ema;
  emaEma: Ema;

  constructor(dema: Dema) {
    super(dema);
    
    this.ema = dema.ema;
    this.emaEma = dema.emaEma;
  }

  getDependencies = (): Indicator[] => [this.ema, this.emaEma];

  calculate(chart: Chart): void {
    const ema = this.getIndicatorValue(chart, 0, this.ema)?.value ?? 0;
    const emaEma = this.getIndicatorValue(chart, 0, this.emaEma)?.value ?? 0;
    const value = 2 * ema - emaEma;

    this.setValue(chart, new MovingAverageValue(value));
  }
}