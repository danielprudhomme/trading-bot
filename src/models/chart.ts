import ccxt from 'ccxt';
import TimeFrame from '../enums/timeframe';
import Indicator from '../indicators/indicator';
import IndicatorValue from '../indicators/indicator-value';
import IndicatorWithValue from '../indicators/indicator-with-value';
import Candlestick from './candlestick';

export default class Chart {
  timeframe: TimeFrame;
  candlesticks: Candlestick[];
  indicators: Indicator[] = [];

  constructor(timeframe: TimeFrame, ohlcv: ccxt.OHLCV[]) {
    this.timeframe = timeframe;
    this.candlesticks = ohlcv.map(x => new Candlestick(x));
  }

  getCandlestickAtIndex = (index: number): Candlestick | null => index < 0 || index >= this.candlesticks.length ? null : this.candlesticks[index];

  hasIndicatorValueAtIndex = (index: number, indicator: Indicator): boolean =>
    this.getCandlestickAtIndex(index)?.hasIndicatorValue(indicator) ?? false;

  getIndicatorValueAtIndex = <T extends IndicatorValue>(index: number, indicator: IndicatorWithValue<T>): T | null =>
    this.getCandlestickAtIndex(index)?.getIndicatorValue(indicator) ?? null;

  setIndicatorValueAtIndex = <T extends IndicatorValue>(index: number, indicator: IndicatorWithValue<T>, value: T) =>
    this.getCandlestickAtIndex(index)?.setIndicatorValue(indicator, value);

  get currentCandlestick() {
    // console.log('current', this.candlesticks.length);
    if (this.candlesticks.length == 0) throw new Error('Chart contains no candlestick.')
    return this.candlesticks[this.candlesticks.length - 1];
  }

  addIndicator(indicator: Indicator) {
    indicator.bind(this);
    this.indicators.push(indicator);
    indicator.calculate();
  }

  newCandlestick(candlestick: Candlestick) {
    // console.log('new', this.timeframe, candlestick.timestamp)
    // console.log('chart new candlestick', this.timeframe, new Date(candlestick.timestamp));
    // checks if candlestick updates the last candlestick or if it is a new one
    const lastCandlestickTimestampStart = this.currentCandlestick.timestamp;
    const lastCandlestickTimestampEnd = lastCandlestickTimestampStart + TimeFrame.toMilliseconds(this.timeframe);

    if (candlestick.timestamp >= lastCandlestickTimestampStart && candlestick.timestamp < lastCandlestickTimestampEnd) {
      candlestick.timestamp = this.currentCandlestick.timestamp;
      this.candlesticks.pop();
    }
    else if (candlestick.timestamp >= lastCandlestickTimestampEnd) {
      candlestick.timestamp = lastCandlestickTimestampEnd;
    }
    this.candlesticks.push(candlestick);

    this.indicators.forEach(indicator => indicator.calculate(this.candlesticks.length - 1));
  }
}
