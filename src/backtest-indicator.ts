import BackTest from './backtest';
import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import BollingerBandsValue from './indicators/bollinger-bands-value';
import Indicator from './indicators/indicator';

export default class BackTestIndicator extends BackTest {
  indicator: Indicator;

  constructor(
    timeFrame: TimeFrame,
    startDate: string,
    endDate: string,
    symbol: string,
    exchangeId: ExchangeId,
    indicator: Indicator
  ) {
    super(timeFrame, timeFrame, startDate, endDate, symbol, exchangeId);
    this.indicator = indicator;
  }

  async init(): Promise<void> {
    this._exchangeService = this.initExchangeService();
    this._chart = await this.initChart();
  }

  async launch(): Promise<void> {
    this.chart.addIndicator(this.indicator);
    this.chart.candles.forEach(candle => {
      const indicatorValue = candle.getIndicatorValue(this.indicator) as BollingerBandsValue;
      console.log(
        `${this.exchangeService.iso8601(candle.timestamp)}\t
        close: ${candle.close}\t
        indicator: ${indicatorValue.lower} ${indicatorValue.basis} ${indicatorValue.upper} `
      );
    }) 
  }
}
