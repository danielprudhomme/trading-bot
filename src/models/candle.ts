import ccxt from 'ccxt';
import Indicator from '../indicators/indicator';

export default class Candle {
  timestamp: number;

  open: number;

  high: number;

  low: number;

  close: number;

  volume: number;

  indicators: Map<Indicator, number> = new Map<Indicator, number>();

  constructor(ohlcv: ccxt.OHLCV) {
    [this.timestamp, this.open, this.high, this.low, this.close, this.volume] = ohlcv;
  }

  hasIndicatorValue = (indicator: Indicator): boolean => this.indicators.has(indicator);
  getIndicatorValue = (indicator: Indicator): number | null => this.indicators.get(indicator) ?? null;
  setIndicatorValue = (indicator: Indicator, value: number): void => { this.indicators.set(indicator, value) };
  
}