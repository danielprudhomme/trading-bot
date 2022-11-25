import IndicatorValue from '../indicators/indicator-value';

export default interface Candlestick {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed: boolean;
  indicators: {
    [indicator: string]: IndicatorValue | null
  }
}