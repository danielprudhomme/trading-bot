export default class IndicatorValue {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  toString = () => `Value:\t${this.value}`;
}