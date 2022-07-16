import ccxt from 'ccxt';
import Indicator from '../indicators/indicator';
import IndicatorValue from '../indicators/indicator-value';

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
  getIndicatorValue = (indicator: Indicator): IndicatorValue | null => this.indicators.get(indicator) ?? null;
  setIndicatorValue = (indicator: Indicator, value: IndicatorValue): void => { this.indicators.set(indicator, value) };
  
}