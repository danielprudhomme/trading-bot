import Indicator from '../indicators/indicator';
import IndicatorValue from '../indicators/indicator-value';
import IndicatorHelper from '../indicators/indicator.helper';
import Candlestick from '../models/candlestick';
import Chart from '../models/chart';

export default class ChartHelper {
  static getCandlestickIndicatorValue = (candlestick: Candlestick, indicator: Indicator): IndicatorValue | undefined =>
    candlestick.indicators[IndicatorHelper.getIndicatorString(indicator)];

  static getIndicatorValue = (chart: Chart, index: number = 0, indicator: Indicator): IndicatorValue | undefined =>
    this.getCandlestickIndicatorValue(chart.candlesticks[index], indicator);

  static getLowWickSize = (candlestick: Candlestick) => {
    const lowestOpenClose = candlestick.open > candlestick.close ? candlestick.close : candlestick.open;
    return (lowestOpenClose - candlestick.low) / candlestick.low; 
  }
}