import Chart from '../models/chart';
import { IndicatorSource } from './indicator-source';

export default abstract class Indicator {
  private _chart: Chart | null = null;
  source: IndicatorSource;

  get chart(): Chart {
    if (this._chart)
      return this._chart;
    throw new Error('Chart should be defined');
  }

  constructor(source: IndicatorSource | null = null) {
    this.source = source ? source : (index: number) => this.chart.getCandleAtIndex(index).close;
  }

  bind = (chart: Chart) => { this._chart = chart; }

  calculate(): void {
    this.chart.candles.forEach((_, index: number) => {
      this.calculateAtIndex(index);
    });
  }

  abstract calculateAtIndex(index: number): void;
}