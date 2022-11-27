import { TimeFrame } from '../timeframe/timeframe';

export interface OHLCV {
  timeframe: TimeFrame;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}