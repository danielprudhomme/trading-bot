import Chart from '../models/chart';

export default abstract class Indicator {
  private _chart: Chart | null = null;

  get chart(): Chart {
    if (this._chart)
      return this._chart;
    throw new Error('Chart should be defined');
  }

  constructor() {
  }

  bind = (chart: Chart) => { this._chart = chart; }

  calculate(): void {
    this.chart.candles.forEach((_, index: number) => {
      this.calculateAtIndex(index);
    });
  }

  abstract calculateAtIndex(index: number): void;
}