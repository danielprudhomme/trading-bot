import IndicatorValue from '../indicator-value';
import { MovingAverageDirection } from './moving-average-direction';

export default class MovingAverageValue extends IndicatorValue {
  direction: MovingAverageDirection;

  constructor(value: number, direction: MovingAverageDirection) {
    super(value);
    this.direction = direction;
  }

  toString = () => `Value: ${this.value}\tDirection: ${this.direction}`;
}