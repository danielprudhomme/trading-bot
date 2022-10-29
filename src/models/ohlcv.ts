import ccxt from 'ccxt';
import TimeFrame from '../enums/timeframe';

export interface OHLCV {
  timeframe: TimeFrame;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const mapFromCcxt = (timeframe: TimeFrame, ohlcv: ccxt.OHLCV): OHLCV => ({
  timeframe,
  timestamp: ohlcv[0],
  open: ohlcv[1],
  high: ohlcv[2],
  low: ohlcv[3],
  close: ohlcv[4],
  volume: ohlcv[5],
});