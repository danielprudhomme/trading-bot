import Indicator from '../indicator';
import { IndicatorSource } from '../indicator-source';

export default abstract class MovingAverage extends Indicator {
  protected length: number;

  constructor(length: number, source: IndicatorSource | null = null) {
    super(source);
    this.length = length;
  }
}

