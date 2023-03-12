import { Direction } from '../direction';
import IndicatorValue from '../indicator-value';

export default class MovingAverageValue extends IndicatorValue {
  direction: Direction;

  constructor(value: number, direction: Direction = null) {
    super(value);
    this.direction = direction;
  }

  toString = () => `Value: ${this.value}\tDirection: ${this.direction}`;
}