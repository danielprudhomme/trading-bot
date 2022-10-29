import Indicator from '../indicators/indicator';
import IndicatorValue from '../indicators/indicator-value';
import IndicatorWithValue from '../indicators/indicator-with-value';
import { OHLCV } from './ohlcv';

export default class Candlestick {
  timestamp: number;
  open: number;
  high: number;
  low: number;  
  close: number;
  volume: number;
  isClosed: boolean;
  indicators: Map<Indicator, IndicatorValue> = new Map<Indicator, IndicatorValue>();

  constructor(ohlcv: OHLCV, isClosed: boolean) {
    ({ timestamp: this.timestamp, open: this.open, high: this.high, low: this.low, close: this.close, volume: this.volume } = ohlcv);
    this.isClosed = isClosed;
  }

  hasIndicatorValue = (indicator: Indicator): boolean => this.indicators.has(indicator);
  getIndicatorValue = <T extends IndicatorValue>(indicator: IndicatorWithValue<T>): T | null => this.indicators.get(indicator) as T ?? null;
  setIndicatorValue = <T extends IndicatorValue>(indicator: IndicatorWithValue<T>, value: T): void => { this.indicators.set(indicator, value) };
  
  get lowWickSize(): number {
    const lowestOpenClose = this.open > this.close ? this.close : this.open;
    return (lowestOpenClose - this.low) / this.low; 
  }
}