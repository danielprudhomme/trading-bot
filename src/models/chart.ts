import ccxt from 'ccxt';
import TimeFrame from '../enums/timeframe';
import { Indicator } from '../indicators/indicator';
import IndicatorValue from '../indicators/indicator-value';
import Candle from './candle';

export default class Chart {
  symbol: string;
  timeframe: TimeFrame;
  candles: Candle[];
  indicators: Indicator[] = [];

  constructor(symbol: string, timeframe: TimeFrame, ohlcv: ccxt.OHLCV[]) {
    this.symbol = symbol;
    this.timeframe = timeframe;
    this.candles = ohlcv.map(x => new Candle(x));
  }

  getCandleAtIndex = (index: number): Candle | null => {
    if (index < 0 || index >= this.candles.length) return null;
    return this.candles[index];
  }

  hasIndicatorValueAtIndex = (index: number, indicator: Indicator): boolean =>
    this.getCandleAtIndex(index)?.hasIndicatorValue(indicator) ?? false;

  getIndicatorValueAtIndex = (index: number, indicator: Indicator): IndicatorValue | null =>
    this.getCandleAtIndex(index)?.getIndicatorValue(indicator) ?? null;
    
  setIndicatorValueAtIndex = (index: number, indicator: Indicator, value: IndicatorValue) =>
    this.getCandleAtIndex(index)?.setIndicatorValue(indicator, value);

  get currentCandle() {
    if (this.candles.length == 0) throw new Error('Chart contains no candle.')
    return this.candles[this.candles.length - 1];
  }

  addIndicator(indicator: Indicator) {
    indicator.bind(this);
    this.indicators.push(indicator);
    indicator.calculate();
  }

  newCandle(candle: Candle) {
    // checks if candle updates the last candle or if it is a new one
    const lastCandleTimestampStart = this.currentCandle.timestamp;
    const lastCandleTimestampEnd = lastCandleTimestampStart + TimeFrame.toMilliseconds(this.timeframe);

    if (candle.timestamp >= lastCandleTimestampStart && candle.timestamp < lastCandleTimestampEnd) {
      candle.timestamp = this.currentCandle.timestamp;
      this.candles.pop();
    }
    else if (candle.timestamp >= lastCandleTimestampEnd) {
      candle.timestamp = lastCandleTimestampEnd;
    }
    this.candles.push(candle);

    this.indicators.forEach(indicator => indicator.calculate(this.candles.length - 1));
  }
}
