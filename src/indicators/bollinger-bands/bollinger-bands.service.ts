import Chart from '../../models/chart';
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

  calculate(chart: Chart, index: number): void {
    const basis = this.getIndicatorValue(chart, index, this.basis)?.value ?? 0;
    const dev = this.mult * (this.getIndicatorValue(chart, index, this.stdev)?.value ?? 0);
    const upper = basis + dev;
    const lower = basis - dev;

    const percentB = ((this.getSourceValue(chart, index) ?? 0) - lower)/(upper - lower);
    const width = (upper - lower) / basis;

    const previousWidth = (this.getIndicatorValue(chart, index + 1) as BollingerBandsValue | undefined)?.width;
    const diffPreviousWidth = previousWidth ? 1 - previousWidth / width : 0;
    let phase: BollingerBandsPhase = 'flat';
    if (diffPreviousWidth > 0.07) phase = 'widening';
    if (diffPreviousWidth < -0.07) phase = 'narrowing';

    this.setValue(chart, index, new BollingerBandsValue(basis, upper, lower, percentB, width, phase));
  }
}