import { IndicatorSource } from '../indicator-source';
import IndicatorWithValue from '../indicator-with-value';
import MovingAverageValue from './moving-average-value';

export default abstract class MovingAverage extends IndicatorWithValue<MovingAverageValue> {
  protected length: number;

  constructor(length: number, source: IndicatorSource | null = null) {
    super(source);
    this.length = length;
  }
}

