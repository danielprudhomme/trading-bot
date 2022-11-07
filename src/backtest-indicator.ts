import BackTest from './backtest';
import TimeFrame from './enums/timeframe';
import Indicator from './indicators/indicator';
import ReadOnlyexchange from './infrastructure/exchange-service/read-only-exchange.service';
import Chart from './models/chart';
import Ticker from './models/ticker';
import StrategyOneTimeFrame from './strategies/strategy-one-timeframe';

class EmptyStrategy extends StrategyOneTimeFrame {
  addIndicators(): void {
  }

  async execute(): Promise<void> {
  }
}

export default class BackTestIndicator extends BackTest {
  indicator: Indicator;
  timeframe: TimeFrame;

  protected _chart: Chart | null = null;
  protected get chart(): Chart {
    if (!this._chart) throw new Error('Chart should not be null.');
    return this._chart;
  }

  constructor(
    timeframe: TimeFrame,
    startDate: string,
    endDate: string,
    ticker: Ticker,
    indicator: Indicator
  ) {
    super(new EmptyStrategy(ticker, timeframe), timeframe, startDate, endDate);
    this.timeframe = timeframe;
    this.indicator = indicator;
  }

  private async initChart(): Promise<Chart> {
    this.startTimestamp = this.exchange.parse8601(this.startDate);
    this.endTimestamp = this.exchange.parse8601(this.endDate);
    // récupérer en plus les 50 périodes précédentes pour être tranquilles sur les calculs
    const startMinus50Periods = this.startTimestamp - TimeFrame.toMilliseconds(this.timeframe) * 50;
    const data = await this.exchange.fetchOHLCVRange(this.ticker, this.timeframe, startMinus50Periods, this.endTimestamp);

    const chart = new Chart(this.timeframe, data);

    (this.exchange as ReadOnlyexchange).addChart(chart);

    return chart;
  }

  async init(): Promise<void> {
    this._chart = await this.initChart();
  }

  async launch(): Promise<void> {
    this.chart.addIndicator(this.indicator);
    this.chart.candlesticks.forEach(candlestick => {
      const indicatorValue = candlestick.getIndicatorValue(this.indicator);
      console.log(
        `${this.exchange.iso8601(candlestick.timestamp)}
        close: ${candlestick.close}
        indicator: ${indicatorValue?.toString()}`
      );
    }) 
  }
}
