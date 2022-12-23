import Chart from '../../models/chart';
import IndicatorValue from '../indicator-value';
import { IndicatorService } from '../indicator.service';
import { RsiDown } from './rsi';

export default class RsiDownService extends IndicatorService {
  constructor(rsiDown: RsiDown) {
    super(rsiDown);
  }

  calculateAtIndex(chart: Chart, index: number): void {
    const value = this.getSourceValue(chart, index);
    const previousValue = this.getSourceValue(chart, index + 1);

    const upValue = value && previousValue ? Math.max(previousValue - value, 0) : 0;
    this.setValue(chart, index, new IndicatorValue(upValue));
  }
}