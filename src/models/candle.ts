import ccxt from 'ccxt';
import Indicator from '../indicators/indicator';
import IndicatorValue from '../indicators/indicator-value';
import IndicatorWithValue from '../indicators/indicator-with-value';

export default class Candle {
  timestamp: number;

  open: number;

  high: number;

  low: number;

  close: number;

  volume: number;

  indicators: Map<Indicator, IndicatorValue> = new Map<Indicator, IndicatorValue>();

  constructor(ohlcv: ccxt.OHLCV) {
    [this.timestamp, this.open, this.high, this.low, this.close, this.volume] = ohlcv;
  }

  hasIndicatorValue = (indicator: Indicator): boolean => this.indicators.has(indicator);
  getIndicatorValue = <T extends IndicatorValue>(indicator: IndicatorWithValue<T>): T | null => this.indicators.get(indicator) as T ?? null;
  setIndicatorValue = <T extends IndicatorValue>(indicator: IndicatorWithValue<T>, value: T): void => { this.indicators.set(indicator, value) };
}