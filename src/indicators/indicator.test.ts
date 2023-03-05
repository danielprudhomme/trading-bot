import ChartHelper from '../helpers/chart.helper';
import { timestampToString } from '../helpers/date';
import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';
import Workspace from '../workspace/workspace';
import Indicator from './indicator';
import IndicatorOnChart from './indicator-on-chart';

export default class IndicatorTest {
  protected timeFrame: TimeFrame;
  protected indicator: Indicator;
  protected ticker: Ticker;

  constructor(timeFrame: TimeFrame, indicator: Indicator, ticker: Ticker) {
    this.timeFrame = timeFrame;
    this.indicator = indicator;
    this.ticker = ticker;
  }
  
  async launch() {
    const indicatorOnChart: IndicatorOnChart = {
      indicator: this.indicator,
      ticker: this.ticker,
      timeframe: this.timeFrame,
    }
    await Workspace.service.chart.fetchAndUpdate([indicatorOnChart], this.timeFrame);

    this.print(0);
    this.print(1);
    this.print(2);
    this.print(3);
    this.print(4);
  }

  private print(index: number = 0) {
    const chart = Workspace.getChart(this.ticker, this.timeFrame);
    const currentCandlestick = chart?.candlesticks[index];
    if (!currentCandlestick) return;

    const indicatorValue = ChartHelper.getCandlestickIndicatorValue(currentCandlestick, this.indicator);
    console.log(`${index}\t${timestampToString(currentCandlestick.timestamp)}\tClose: ${currentCandlestick.close}\t${indicatorValue?.toString()}`);
  }
}
