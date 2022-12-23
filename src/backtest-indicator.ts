import ChartHelper from './helpers/chart.helper';
import { timestampToString } from './helpers/date';
import Indicator from './indicators/indicator';
import IndicatorOnChart from './indicators/indicator-on-chart';
import Ticker from './models/ticker';
import ChartService from './services/chart.service';
import { TimeFrame } from './timeframe/timeframe';
import Workspace from './workspace';

export default class BackTestIndicator {

  protected timeFrame: TimeFrame;
  protected indicator: Indicator;
  protected ticker: Ticker;

  constructor(timeFrame: TimeFrame, indicator: Indicator, ticker: Ticker) {
    this.timeFrame = timeFrame;
    this.indicator = indicator;
    this.ticker = ticker;
  }

  protected get chartService(): ChartService {
    return Workspace.chartService;
  }
  
  async launch() {
    const indicatorOnChart: IndicatorOnChart = {
      indicator: this.indicator,
      ticker: this.ticker,
      timeframe: this.timeFrame,
    }
    await this.chartService.fetchAndUpdate([indicatorOnChart], this.timeFrame);

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
    console.log(`${index}\t${timestampToString(currentCandlestick.timestamp)}\t${currentCandlestick.close}\t${indicatorValue?.toString()}`);
  }
}
