import Ticker from '../models/ticker';

export default class TickerHelper {
  static toString = (ticker: Ticker): string => `${ticker.exchangeId}/${ticker.asset}/${ticker.base}`;
  static areEqual = (ticker1: Ticker, ticker2: Ticker): boolean => this.toString(ticker1) === this.toString(ticker2);
}