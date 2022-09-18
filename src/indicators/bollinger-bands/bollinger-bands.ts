import IndicatorWithValue from '../indicator-with-value';
import SMA from '../moving-average/sma';
import BollingerBandsValue from './bollinger-bands-value';
import StandardDeviation from './standard-deviation';

export default class BollingerBands extends IndicatorWithValue<BollingerBandsValue> {
  private mult: number;
  private basis: SMA;
  private stdev: StandardDeviation;

  constructor(length: number = 20, mult: number = 2) {
    super();
    this.mult = mult;
    
    this.basis = new SMA(length);
    this.addDependency(this.basis);
    this.stdev = new StandardDeviation(length);
    this.addDependency(this.stdev);
  }

  protected calculateAtIndex(index: number): BollingerBandsValue | null {
    const basis = this.chart.getIndicatorValueAtIndex(index, this.basis)?.value ?? 0;
    const dev = this.mult * (this.chart.getIndicatorValueAtIndex(index, this.stdev)?.value ?? 0);
    const upper = basis + dev;
    const lower = basis - dev;

    return new BollingerBandsValue(basis, upper, lower);
  }
}