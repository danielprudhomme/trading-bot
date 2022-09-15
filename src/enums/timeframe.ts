export default class TimeFrame {
  static t15s = '15s';

  static t30s = '30s';

  static t1m = '1m';

  static t5m = '5m';

  static t15m = '15m';

  static t1h = '1h';

  static t4h = '4h';

  static t1d = '1d';

  static t1w = '1w';

  static t1M = '1M';

  static toMilliseconds(tf: TimeFrame): number {
    if (tf === TimeFrame.t15s) {
      return 15 * 1000;
    }
    if (tf === TimeFrame.t30s) {
      return 30 * 1000;
    }
    if (tf === TimeFrame.t1m) {
      return 60 * 1000;
    }
    if (tf === TimeFrame.t5m) {
      return 5 * TimeFrame.toMilliseconds(TimeFrame.t1m);
    }
    if (tf === TimeFrame.t15m) {
      return 15 * TimeFrame.toMilliseconds(TimeFrame.t1m);
    }
    if (tf === TimeFrame.t1h) {
      return 60 * TimeFrame.toMilliseconds(TimeFrame.t1m);
    }
    if (tf === TimeFrame.t1d) {
      return 60 * 60 * 24 * 1000;
    }
    if (tf === TimeFrame.t1w) {
      return 7 * 60 * 24 * 1000;
    }
    throw new Error('Timeframe not found');
  }

  static compare = (a: TimeFrame, b: TimeFrame): number => TimeFrame.toMilliseconds(a) - TimeFrame.toMilliseconds(b);

  
}
