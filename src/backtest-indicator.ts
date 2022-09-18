import BackTest from './backtest';
import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import ReadOnlyExchangeService from './exchange-service/read-only-exchange.service';
import Indicator from './indicators/indicator';
import Chart from './models/chart';
import StrategyOneTimeFrame from './strategies/strategy-one-timeframe';

class EmptyStrategy extends StrategyOneTimeFrame {
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
    symbol: string,
    exchangeId: ExchangeId,
    indicator: Indicator
  ) {
    super(new EmptyStrategy(timeframe), timeframe, startDate, endDate, symbol, exchangeId);
    this.timeframe = timeframe;
    this.indicator = indicator;
  }

  private async initChart(): Promise<Chart> {
    this.startTimestamp = this.exchangeService.parse8601(this.startDate);
    this.endTimestamp = this.exchangeService.parse8601(this.endDate);
    // récupérer en plus les 50 périodes précédentes pour être tranquilles sur les calculs
    const startMinus50Periods = this.startTimestamp - TimeFrame.toMilliseconds(this.timeframe) * 50;
    const data = await this.exchangeService.fetchOHLCVRange(this.symbol, this.timeframe, startMinus50Periods, this.endTimestamp);

    const chart = new Chart(this.symbol, this.timeframe, data);

    (this.exchangeService as ReadOnlyExchangeService).addChart(chart);

    return chart;
  }

  async init(): Promise<void> {
    this._exchangeService = this.initExchangeService();
    this._chart = await this.initChart();
  }

  async launch(): Promise<void> {
    this.chart.addIndicator(this.indicator);
    this.chart.candles.forEach(candle => {
      const indicatorValue = candle.getIndicatorValue(this.indicator);
      console.log(
        `${this.exchangeService.iso8601(candle.timestamp)}
        close: ${candle.close}
        indicator: ${indicatorValue?.toString()}`
      );
    }) 
  }
}
