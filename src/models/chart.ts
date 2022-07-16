import ccxt from 'ccxt';
import TimeFrame from '../enums/timeframe';
import Indicator from '../indicators/indicator';
import IndicatorValue from '../indicators/indicator-value';
import Candle from './candle';

export default class Chart {
  timeframe: TimeFrame;
  candles: Candle[];
  indicators: Indicator[] = [];

  constructor(timeframe: TimeFrame, ohlcv: ccxt.OHLCV[]) {
    this.timeframe = timeframe;
    this.candles = ohlcv.map(x => new Candle(x));
  }

  getCandleAtIndex = (index: number) => this.candles[index];

  hasIndicatorValueAtIndex = (index: number, indicator: Indicator): boolean =>
    this.getCandleAtIndex(index).hasIndicatorValue(indicator);

  getIndicatorValueAtIndex = (index: number, indicator: Indicator): IndicatorValue | null =>
    this.getCandleAtIndex(index).getIndicatorValue(indicator);
    
  setIndicatorValueAtIndex = (index: number, indicator: Indicator, value: IndicatorValue) =>
    this.getCandleAtIndex(index).setIndicatorValue(indicator, value);

  getLastCandle = () => this.candles[this.candles.length - 1];

  addIndicator(indicator: Indicator) {
    indicator.bind(this);
    this.indicators.push(indicator);
    indicator.calculate();
  }

  newCandle(candle: Candle) {
    // checks if candle updates the last candle or if it is a new one
    const lastCandle = this.getLastCandle();
    const lastCandleTimestampStart = lastCandle.timestamp;
    const lastCandleTimestampEnd = lastCandleTimestampStart + TimeFrame.toMilliseconds(this.timeframe);

    if (candle.timestamp >= lastCandleTimestampStart && candle.timestamp < lastCandleTimestampEnd) {
      candle.timestamp = lastCandle.timestamp;
      this.candles.pop();
    }
    else if (candle.timestamp >= lastCandleTimestampEnd) {
      candle.timestamp = lastCandleTimestampEnd;
    }
    this.candles.push(candle);

    this.indicators.forEach(indicator => indicator.calculateAtIndex(this.candles.length - 1));
  }
}
