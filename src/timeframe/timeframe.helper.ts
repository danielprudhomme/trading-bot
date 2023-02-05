import { TimeFrame } from './timeframe';

export default class TimeFrameHelper {
  static toMilliseconds(tf: TimeFrame): number {
    if (tf === '15s') {
      return 15 * 1000;
    }
    if (tf === '30s') {
      return 30 * 1000;
    }
    if (tf === '1m') {
      return 60 * 1000;
    }
    if (tf === '2m') {
      return 2 * this.toMilliseconds('1m');
    }
    if (tf === '5m') {
      return 5 * this.toMilliseconds('1m');
    }
    if (tf === '15m') {
      return 15 * this.toMilliseconds('1m');
    }
    if (tf === '30m') {
      return 30 * this.toMilliseconds('1m');
    }
    if (tf === '1h') {
      return 60 * this.toMilliseconds('1m');
    }
    if (tf === '2h') {
      return 2 * this.toMilliseconds('1h');
    }
    if (tf === '4h') {
      return 4 * this.toMilliseconds('1h');
    }
    if (tf === '1d') {
      return 60 * 60 * 24 * 1000;
    }
    if (tf === '1w') {
      return 7 * 60 * 24 * 1000;
    }
    throw new Error('Timeframe not found');
  }

  static compare = (a: TimeFrame, b: TimeFrame): number => this.toMilliseconds(a) - this.toMilliseconds(b);
}
