import Chart from '../../models/chart';
import Indicator from '../indicator';
import IndicatorValue from '../indicator-value';
import { IndicatorService } from '../indicator.service';
import { Rma } from '../moving-average/rma';
import { Rsi } from './rsi';

export default class RsiService extends IndicatorService {
  length: number;
  upRma: Rma;
  downRma: Rma;

  constructor(rsi: Rsi) {
    super(rsi);
    
    this.length = rsi.length;
    this.upRma = rsi.upRma;
    this.downRma = rsi.downRma;
  }

  getDependencies = (): Indicator[] => [this.upRma, this.downRma];
  
  calculate(chart: Chart, index: number): void {
    const up = this.getIndicatorValue(chart, index, this.upRma)?.value;
    const down = this.getIndicatorValue(chart, index, this.downRma)?.value;
    const rsi = !down || down == 0 ? 100 : !up || up == 0 ? 0 : 100 - 100 / (1 + up / down);
    this.setValue(chart, index, new IndicatorValue(rsi));
  }
}

