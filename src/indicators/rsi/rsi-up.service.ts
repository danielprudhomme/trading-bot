import Chart from '../../models/chart';
import indicator from '../indicator';
import IndicatorValue from '../indicator-value';
import { IndicatorService } from '../indicator.service';
import { RsiUp } from './rsi';

export default class RsiUpService extends IndicatorService {
  constructor(rsiUp: RsiUp) {
    super(rsiUp);
  }

  getDependencies = (): indicator[] => [];

  calculate(chart: Chart, index: number): void {
    const value = this.getSourceValue(chart, index);
    const previousValue = this.getSourceValue(chart, index + 1);

    const upValue = value && previousValue ? Math.max(value - previousValue, 0) : 0;
    this.setValue(chart, index, new IndicatorValue(upValue));
  }
}