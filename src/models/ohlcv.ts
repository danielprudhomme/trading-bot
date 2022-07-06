// [
//   1504541580000, // UTC timestamp in milliseconds, integer
//   4235.4,        // (O)pen price, float
//   4240.6,        // (H)ighest price, float
//   4230.0,        // (L)owest price, float
//   4230.7,        // (C)losing price, float
//   37.72941911    // (V)olume float
// (usually in terms of the base currency,
// the exchanges docstring may list whether quote or base units are used)
// ],

export default class Ohlcv {
  timestamp: number;

  open: number;

  high: number;

  low: number;

  close: number;

  volume: number;

  constructor(
    timestamp: number,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number,
  ) {
    this.timestamp = timestamp;
    this.open = open;
    this.high = high;
    this.low = low;
    this.close = close;
    this.volume = volume;
  }

  getDate = (): Date => new Date(this.timestamp);
}
