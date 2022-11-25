import Candlestick from '../models/candlestick';
import Chart from '../models/chart';
import Indicator from './indicator';
import IndicatorValue from './indicator-value';

export abstract class IndicatorService {
  indicator: Indicator;

  constructor(indicator: Indicator) {
    this.indicator = indicator;
  }

  /* Get indicators that should be calculated before this one (except source) */
  getDependencies = (): Indicator[] => [];

  /* Calculate indicator value for last candlestick of chart */
  abstract calculate(chart: Chart): void;

  protected setValue(chart: Chart, value: IndicatorValue | null) {
    chart.candlesticks[0].indicators[this.getIndicatorString()] = value;
  }

  protected getCandlestickSourceValue = (candlestick: Candlestick): number | undefined => {
    if (this.indicator.source === 'close') return candlestick.close;

    const sourceIndicator = this.getIndicatorString(this.indicator.source);
    return candlestick.indicators[sourceIndicator]?.value;
  }

  protected getSourceValue = (chart: Chart, index: number = 0): number | undefined =>
    this.getCandlestickSourceValue(chart.candlesticks[index]);

  protected getCandlestickIndicatorValue = (candlestick: Candlestick, indicator: Indicator = this.indicator): number | undefined =>
    candlestick.indicators[this.getIndicatorString(indicator)]?.value;

  protected getIndicatorValue = (chart: Chart, index: number = 0, indicator: Indicator = this.indicator): number | undefined =>
    this.getCandlestickIndicatorValue(chart.candlesticks[index], indicator);

  private getIndicatorString = (indicator: Indicator = this.indicator) => JSON.stringify(indicator);
}