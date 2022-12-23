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

  calculateAtIndex(chart: Chart, index: number): void {
    const ema = this.getIndicatorValue(chart, index, this.ema)?.value ?? 0;
    const emaEma = this.getIndicatorValue(chart, index, this.emaEma)?.value ?? 0;
    const value = 2 * ema - emaEma;

    this.setValue(chart, index, new MovingAverageValue(value));
  }
}