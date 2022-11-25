import chart from '../../models/chart';
import Indicator from '../indicator';
import IndicatorValue from '../indicator-value';
import { IndicatorService } from '../indicator.service';
import { Rsi, RsiRma } from './rsi';

export default class RsiService extends IndicatorService {
  length: number;
  upRma: RsiRma;
  downRma: RsiRma;

  constructor(rsi: Rsi) {
    super(rsi);
    
    this.length = rsi.length;
    this.upRma = rsi.upRma;
    this.downRma = rsi.downRma;
  }

  getDependencies = (): Indicator[] => [this.upRma, this.downRma];
  
  calculate(chart: chart): void {
    const up = this.getIndicatorValue(chart, 0, this.upRma);
    const down = this.getIndicatorValue(chart, 0, this.downRma);

    if (up && down) {
      const rsi = down == 0 ? 100 : up == 0 ? 0 : 100 - (100 / (1 + up / down));
      this.setValue(chart, new IndicatorValue(rsi));
    }

    this.setValue(chart, null);
  }
}

