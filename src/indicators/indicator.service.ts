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

  /* Calculate indicator value at index */
  calculate = (chart: Chart, index: number = 0): void => this.calculateAtIndex(chart, index);

  /* Calculate indicator value at index */
  abstract calculateAtIndex(chart: Chart, index: number): void;

  protected setValue(chart: Chart, index: number, value: IndicatorValue | null | undefined) {
    chart.candlesticks[index].indicators[IndicatorHelper.toString(this.indicator)] = value;
  }

  protected getSourceValue = (chart: Chart, index: number): number | undefined =>
    index < chart.candlesticks.length ? this.getCandlestickSourceValue(chart.candlesticks[index]) : undefined;

  protected getCandlestickSourceValue = (candlestick: Candlestick): number | undefined => {
    if (this.indicator.source === 'close') return candlestick.close;

    const sourceIndicator = IndicatorHelper.toString(this.indicator.source);
    return candlestick.indicators[sourceIndicator]?.value;
  }

  protected getIndicatorValue = (chart: Chart, index: number, indicator: Indicator = this.indicator): IndicatorValue | null | undefined =>
    ChartHelper.getIndicatorValue(chart, index, indicator);
}