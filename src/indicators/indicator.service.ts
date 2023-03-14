import ChartHelper from '../helpers/chart.helper';
import Chart from '../models/chart';
import Indicator, { sourceIsIndicator } from './indicator';
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
  abstract calculate(chart: Chart, index: number): void;
  
  protected setValue(chart: Chart, index: number, value: IndicatorValue | null | undefined) {
    chart.candlesticks[index].indicators[IndicatorHelper.toString(this.indicator)] = value;
  }

  protected getSourceValue = (chart: Chart, index: number): number | undefined => {
    const candlestick = chart.candlesticks[index];
    if (!candlestick) return undefined;
    
    if (this.indicator.source === 'close') return candlestick.close;

    if (sourceIsIndicator(this.indicator.source)) {
      const sourceIndicator = IndicatorHelper.toString(this.indicator.source as Indicator);
      return candlestick.indicators[sourceIndicator]?.value;
    }

    return this.indicator.source(chart, index);
  }

  protected getIndicatorValue = (chart: Chart, index: number, indicator: Indicator = this.indicator): IndicatorValue | null | undefined =>
    ChartHelper.getIndicatorValue(chart, index, indicator);
}