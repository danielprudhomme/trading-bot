import IndicatorValue from '../indicator-value';
import { BollingerBandsPhase } from './bollinger-bands-phase';

export default class BollingerBandsValue extends IndicatorValue {
  basis: number;
  upper: number;
  lower: number;
  percentB: number; // où se situe le prix par rapport aux bandes [0, 1]
  width: number;
  phase: BollingerBandsPhase;

  constructor(
    basis: number,
    upper: number,
    lower: number,
    percentB: number,
    width: number,
    phase: BollingerBandsPhase,
  ) {
    super(basis);
    this.basis = basis;
    this.upper = upper;
    this.lower = lower;
    this.percentB = percentB;
    this.width = width;
    this.phase = phase;
  }

  toString = () => `\tUpper: ${this.upper}\tLower: ${this.lower}\tPhase: ${this.phase}`;
}