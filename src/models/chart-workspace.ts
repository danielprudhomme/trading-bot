import TimeFrame from "../enums/timeframe";
import Candlestick from "./candlestick";
import Chart from "./chart";

export default class ChartWorkspace {
  private charts: Map<TimeFrame, Chart> = new Map<TimeFrame, Chart>();

  set = (timeframe: TimeFrame, chart: Chart) => this.charts.set(timeframe, chart);

  get = (timeframe: TimeFrame) => this.charts.get(timeframe);

  newCandlestick = (candlestick: Candlestick) => this.charts.forEach(chart => chart.newCandlestick({...candlestick}));
}