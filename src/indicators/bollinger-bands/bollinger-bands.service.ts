import chart from '../../models/chart';
import Indicator from '../indicator';
import { IndicatorService } from '../indicator.service';
import { Sma } from '../moving-average/sma';
import BollingerBands from './bollinger-bands';
import { BollingerBandsPhase } from './bollinger-bands-phase';
import BollingerBandsValue from './bollinger-bands-value';
import StandardDeviation from './standard-deviation';

export default class BollingerBandsService extends IndicatorService {
  length: number;
  mult: number;
  basis: Sma;
  stdev: StandardDeviation;

  constructor(bb: BollingerBands) {
    super(bb);
    
    this.length = bb.length;
    this.mult = bb.mult;
    this.basis = bb.basis;
    this.stdev = bb.stdev;
  }

  getDependencies = (): Indicator[] => [this.basis, this.stdev];

  calculate(chart: chart): void {
    const basis = this.getIndicatorValue(chart, 0, this.basis)?.value ?? 0;
    const dev = this.mult * (this.getIndicatorValue(chart, 0, this.stdev)?.value ?? 0);
    const upper = basis + dev;
    const lower = basis - dev;

    const percentB = ((this.getSourceValue(chart) ?? 0) - lower)/(upper - lower);
    const width = (upper - lower) / basis;

    const previousWidth = (this.getIndicatorValue(chart, 1) as BollingerBandsValue | undefined)?.width;
    const diffPreviousWidth = previousWidth ? 1 - previousWidth / width : 0;
    let phase: BollingerBandsPhase = 'flat';
    if (diffPreviousWidth > 0.05) phase = 'widening';
    if (diffPreviousWidth < -0.05) phase = 'narrowing';

    this.setValue(chart, new BollingerBandsValue(basis, upper, lower, percentB, width, phase));
  }
}