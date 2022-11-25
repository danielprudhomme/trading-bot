import chart from '../../models/chart';
import IndicatorValue from '../indicator-value';
import { IndicatorService } from '../indicator.service';
import { RsiDown } from './rsi';

export default class RsiDownService extends IndicatorService {
  constructor(rsiDown: RsiDown) {
    super(rsiDown);
  }

  calculate(chart: chart): void {
    const value = this.getSourceValue(chart);
    const previousValue = this.getSourceValue(chart, 1);

    const upValue = value && previousValue ? -Math.min(value - previousValue, 0) : 0;
    this.setValue(chart, new IndicatorValue(upValue));
  }
}