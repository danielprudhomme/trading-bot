import IndicatorValue from '../indicator-value';

export default class BollingerBandsValue extends IndicatorValue {
  basis: number;
  upper: number;
  lower: number;
  percentBandWidth: number; // où se situe le prix par rapport aux bandes

  constructor(basis: number, upper: number, lower: number, percentBandWidth: number) {
    super(basis);
    this.basis = basis;
    this.upper = upper;
    this.lower = lower;
    this.percentBandWidth = percentBandWidth;
  }

  toString = () => `Basis: ${this.basis}\tUpper: ${this.upper}\tLower: ${this.lower}\t%B: ${this.percentBandWidth}`;
}