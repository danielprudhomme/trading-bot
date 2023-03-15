import Indicator from './indicator';

// keep a list of serialized functions
const functions:any[] = [];

// json replacer - returns a placeholder for functions
const jsonReplacer = function (key: any, val: any) {
  if (typeof val === 'function') {
    functions.push(val.toString());
    return "{func_" + (functions.length - 1) + "}";
  }
  return val;
};

// regex replacer - replaces placeholders with functions
const funcReplacer = function (match: any, id: any) {
   return functions[id];
};

export default class IndicatorHelper {
  static toString = (indicator: Indicator): string => JSON.stringify(indicator, jsonReplacer)               // generate json with placeholders
                                                          .replace(/"\{func_(\d+)\}"/g, funcReplacer);
  static areEqual = (indicator1: Indicator, indicator2: Indicator): boolean => this.toString(indicator1) === this.toString(indicator2);
}
