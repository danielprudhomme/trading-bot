import TimeFrame from '../enums/timeframe';
import Chart from '../models/chart-old';
import Ticker from '../models/ticker';
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

  constructor(ticker: Ticker, timeframe: TimeFrame) {
    super(ticker, [timeframe]);
  }
}