import TimeFrame from "../enums/timeframe";
import Candle from "./candle";
import Chart from "./chart";

export default class ChartWorkspace {
  symbol: string;
  private charts: Map<TimeFrame, Chart> = new Map<TimeFrame, Chart>();

  constructor(symbol: string) {
    this.symbol = symbol;
  }

  set = (timeframe: TimeFrame, chart: Chart) => this.charts.set(timeframe, chart);

  get = (timeframe: TimeFrame) => this.charts.get(timeframe);

  newCandle = (candle: Candle) => this.charts.forEach(chart => chart.newCandle(candle));
}