import TimeFrame from '../enums/timeframe';
import Chart from './chart';
import { OHLCV } from './ohlcv';

export default class ChartWorkspace {
  private charts: Map<TimeFrame, Chart> = new Map<TimeFrame, Chart>();

  set = (timeframe: TimeFrame, chart: Chart) => this.charts.set(timeframe, chart);

  get = (timeframe: TimeFrame) => this.charts.get(timeframe);

  newOHLCV = (ohlcv: OHLCV) => this.charts.forEach(chart => chart.newOHLCV(ohlcv));
}