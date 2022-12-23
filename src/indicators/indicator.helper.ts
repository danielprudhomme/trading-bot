import Indicator from './indicator';

export default class IndicatorHelper {
  static toString = (indicator: Indicator): string => JSON.stringify(indicator);
  static areEqual = (indicator1: Indicator, indicator2: Indicator): boolean => this.toString(indicator1) === this.toString(indicator2);
}