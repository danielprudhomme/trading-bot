import Indicator from './indicator';

export default class IndicatorHelper {
  static getIndicatorString = (indicator: Indicator) => JSON.stringify(indicator);
}