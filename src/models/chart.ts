import TimeFrame from '../enums/timeframe';
import Indicator from '../indicators/indicator';
import IndicatorValue from '../indicators/indicator-value';
import IndicatorWithValue from '../indicators/indicator-with-value';
import Candlestick from './candlestick';
import { OHLCV } from './ohlcv';

export default class Chart {
  timeframe: TimeFrame;
  candlesticks: Candlestick[];
  indicators: Indicator[] = [];

  constructor(timeframe: TimeFrame, ohlcvs: OHLCV[]) {
    this.timeframe = timeframe;
    this.candlesticks = ohlcvs.map(ohlcv => new Candlestick(ohlcv, true));
  }

  getCandlestickAtIndex = (index: number): Candlestick | null => index < 0 || index >= this.candlesticks.length ? null : this.candlesticks[index];

  getCandlestickFromEnd = (index: number): Candlestick | null => {
    if (index > 0) throw new Error('Index should be negative');
    if (this.candlesticks.length + index < 0) return null;
    return this.candlesticks[this.candlesticks.length + index - 1];
  }

  hasIndicatorValueAtIndex = (index: number, indicator: Indicator): boolean =>
    this.getCandlestickAtIndex(index)?.hasIndicatorValue(indicator) ?? false;

  getIndicatorValueAtIndex = <T extends IndicatorValue>(index: number, indicator: IndicatorWithValue<T>): T | null =>
    this.getCandlestickAtIndex(index)?.getIndicatorValue(indicator) ?? null;

  setIndicatorValueAtIndex = <T extends IndicatorValue>(index: number, indicator: IndicatorWithValue<T>, value: T) =>
    this.getCandlestickAtIndex(index)?.setIndicatorValue(indicator, value);

  get currentCandlestick() {
    if (this.candlesticks.length == 0) throw new Error('Chart contains no candlestick.')
    return this.candlesticks[this.candlesticks.length - 1];
  }

  addIndicator(indicator: Indicator) {
    indicator.bind(this);
    this.indicators.push(indicator);
    indicator.calculate();
  }

  newOHLCV(ohlcv: OHLCV) {
    const isNewCandle = Number.isInteger(ohlcv.timestamp / TimeFrame.toMilliseconds(this.timeframe));
    const isClosed = Number.isInteger((ohlcv.timestamp + TimeFrame.toMilliseconds(ohlcv.timeframe)) / TimeFrame.toMilliseconds(this.timeframe));

    if (!isNewCandle) this.candlesticks.pop();
    const candlestick = new Candlestick(ohlcv, isClosed);
    this.candlesticks.push(candlestick);
    
    this.indicators.forEach(indicator => indicator.calculate(this.candlesticks.length - 1));
  }
}
