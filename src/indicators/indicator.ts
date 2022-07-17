import Chart from '../models/chart';
import { IndicatorSource } from './indicator-source';

export default abstract class Indicator {
  private _chart: Chart | null = null;
  source: IndicatorSource;
  dependencies: Indicator[] = [];

  get chart(): Chart {
    if (this._chart)
      return this._chart;
    throw new Error('Chart should be defined');
  }

  constructor(source: IndicatorSource | null = null) {
    this.source = source ? source : (index: number) => this.chart.getCandleAtIndex(index).close;
  }

  bind = (chart: Chart) => { 
    this._chart = chart;
    this.dependencies.forEach(indicator => indicator.bind(this.chart));
  }

  // If index is null, calculate for all candles
  calculate(index: number | null = null): void {
    this.dependencies.forEach(indicator => indicator.calculate(index));

    if (index === null) {
      this.chart.candles.forEach((_, index: number) => {
        this.calculateAtIndex(index);
      });
      return;
    }

    this.calculateAtIndex(index);
  }

  protected abstract calculateAtIndex(index: number): void;

  addDependency(indicator: Indicator): void {
    
    this.dependencies.push(indicator);
  }
}
