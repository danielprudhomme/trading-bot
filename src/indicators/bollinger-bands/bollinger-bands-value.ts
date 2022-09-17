import IndicatorValue from '../indicator-value';

export default class BollingerBandsValue extends IndicatorValue {
  basis: number;
  upper: number;
  lower: number;

  constructor(basis: number, upper: number, lower: number) {
    super(basis);
    this.basis = basis;
    this.upper = upper;
    this.lower = lower;
  }

  toString = () => `Basis: ${this.basis}\tUpper: ${this.upper}\tLower: ${this.lower}`;
}