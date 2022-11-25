import chart from '../../models/chart';
import indicator from '../indicator';
import IndicatorValue from '../indicator-value';
import { IndicatorService } from '../indicator.service';
import { RsiUp } from './rsi';

export default class RsiUpService extends IndicatorService {
  constructor(rsiUp: RsiUp) {
    super(rsiUp);
  }

  getDependencies = (): indicator[] => [];

  calculate(chart: chart): void {
    const value = this.getSourceValue(chart);
    const previousValue = this.getSourceValue(chart, 1);

    const upValue = value && previousValue ? Math.max(value - previousValue, 0) : 0;
    this.setValue(chart, new IndicatorValue(upValue));
  }
}