import { Direction } from '../direction';
import IndicatorValue from '../indicator-value';

export default class SupertrendValue extends IndicatorValue {
  direction: Direction;
  upperBand: number;
  lowerBand: number;

  constructor(value: number, direction: Direction, upperBand: number, lowerBand: number) {
    super(value);
    this.direction = direction;
    this.upperBand = upperBand;
    this.lowerBand = lowerBand;
  }

  toString = () => `Value: ${this.value}\tDirection: ${this.direction}`;
}