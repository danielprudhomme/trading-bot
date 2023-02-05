import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';

export function getBacktestDataFile(ticker: Ticker, year: number, timeframe: TimeFrame): string {
  return `backtest-data/${ticker.exchangeId}/${ticker.asset}-${ticker.base}/${ticker.asset}-${ticker.base}-${year}-${timeframe}.json`;
}