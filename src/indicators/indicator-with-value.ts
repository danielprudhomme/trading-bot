import Chart from '../models/chart';
import Indicator from './indicator';
import { IndicatorSource } from './indicator-source';
import IndicatorValue from './indicator-value';

export default abstract class IndicatorWithValue<T extends IndicatorValue> {
  private _chart: Chart | null = null;
  source: IndicatorSource;
  dependencies: Indicator[] = [];

  get chart(): Chart {
    if (this._chart)
      return this._chart;
    throw new Error('Chart should be defined');
  }

  constructor(source: IndicatorSource | null = null) {
    this.source = source ? source : (index: number) => this.chart.getCandleAtIndex(index)?.close ?? 0;
  }

  bind = (chart: Chart) => { 
    this._chart = chart;
    this.dependencies.forEach(dependency => dependency.bind(this.chart));
  }

  // If index is null, calculate for all candles
  calculate(index: number | null = null): void {
    this.dependencies.forEach(indicator => indicator.calculate(index));

    if (index === null) {
      this.chart.candles.forEach((_, index: number) => {
        this.calculateAndSetValue(index);
      });
      return;
    }

    this.calculateAndSetValue(index);
  }

  protected abstract calculateAtIndex(index: number): T | null;

  protected calculateAndSetValue(index: number) {
    const value = this.calculateAtIndex(index);
    if (value) {
      this.chart.setIndicatorValueAtIndex(index, this, value);
    }
  }

  protected getValue = (index: number): T | null => this.chart.getIndicatorValueAtIndex(index, this) as T | null;

  addDependency(indicator: Indicator): void {
    this.dependencies.push(indicator);
  }
}
