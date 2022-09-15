import TimeFrame from '../enums/timeframe';
import Chart from '../models/chart';
import Strategy from './strategy';

export default abstract class StrategyOneTimeFrame extends Strategy {
  protected get timeframe(): TimeFrame {
    return this.timeframes[0];
  }

  protected get chart(): Chart {
    const chart = this.chartWorkspace.get(this.timeframes[0]);
    if (!chart) throw new Error('Chart should be defined here.');
    return chart;
  }

  constructor(timeframe: TimeFrame) {
    super([timeframe]);
  }
}