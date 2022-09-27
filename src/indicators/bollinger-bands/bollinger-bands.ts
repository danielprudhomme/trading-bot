import IndicatorWithValue from '../indicator-with-value';
import SMA from '../moving-average/sma';
import { BollingerBandsPhase } from './bollinger-bands-phase';
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

    const percentB = (this.chart.getCandlestickAtIndex(index)?.close ?? 0 - lower)/(upper - lower);

    const width = (upper - lower) / basis;

    const previousWidth = this.getValue(index - 1)?.width;
    const diffPreviousWidth = previousWidth ? 1 - previousWidth / width : 0;
    let phase: BollingerBandsPhase = 'flat';
    if (diffPreviousWidth > 0.05) phase = 'widening';
    if (diffPreviousWidth < -0.05) phase = 'narrowing';

    return new BollingerBandsValue(basis, upper, lower, percentB, width, phase);
  }
}