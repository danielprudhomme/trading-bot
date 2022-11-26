import Chart from '../../models/chart';
import Indicator from '../indicator';
import { IndicatorService } from '../indicator.service';
import Dema from './dema';
import MacdZeroLag from './macd-zero-lag';
import MacdZeroLagValue from './macd-zero-lag-value';

export default class MacdZeroLagService extends IndicatorService {
  private fastDema: Dema;
  private slowDema: Dema;
  private signal: Dema;
  
  constructor(macdZeroLag: MacdZeroLag) {
    super(macdZeroLag);
    
    this.fastDema = macdZeroLag.fastDema;
    this.slowDema = macdZeroLag.slowDema;
    this.signal = macdZeroLag.signal;
  }

  getDependencies = (): Indicator[] => [this.fastDema, this.slowDema, this.signal];

  calculate(chart: Chart): void {
    const macdZeroLag = (this.getIndicatorValue(chart, 0, this.fastDema)?.value ?? 0) - (this.getIndicatorValue(chart, 0, this.slowDema)?.value ?? 0);
    const signal = this.getIndicatorValue(chart, 0, this.signal)?.value ?? 0;
    this.setValue(chart, new MacdZeroLagValue(macdZeroLag, signal));
  }
}
