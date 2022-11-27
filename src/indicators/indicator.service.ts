import ChartHelper from '../helpers/chart.helper';
import Candlestick from '../models/candlestick';
import Chart from '../models/chart';
import Indicator from './indicator';
import IndicatorValue from './indicator-value';
import IndicatorHelper from './indicator.helper';

export abstract class IndicatorService {
  indicator: Indicator;

  constructor(indicator: Indicator) {
    this.indicator = indicator;
  }

  /* Get indicators that should be calculated before this one (except source) */
  getDependencies = (): Indicator[] => [];

  /* Calculate indicator value for last candlestick of chart */
  abstract calculate(chart: Chart): void;

  protected setValue(chart: Chart, value: IndicatorValue | undefined) {
    chart.candlesticks[0].indicators[IndicatorHelper.getIndicatorString(this.indicator)] = value;
  }

  protected getSourceValue = (chart: Chart, index: number = 0): number | undefined =>
    this.getCandlestickSourceValue(chart.candlesticks[index]);

  protected getCandlestickSourceValue = (candlestick: Candlestick): number | undefined => {
    if (this.indicator.source === 'close') return candlestick.close;

    const sourceIndicator = IndicatorHelper.getIndicatorString(this.indicator.source);
    return candlestick.indicators[sourceIndicator]?.value;
  }

  protected getIndicatorValue = (chart: Chart, index: number = 0, indicator: Indicator = this.indicator): IndicatorValue | undefined =>
    ChartHelper.getIndicatorValue(chart, index, indicator);
}