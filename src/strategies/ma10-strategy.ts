import MovingAverage from '../indicators/moving-average';
import Ohlcv from '../models/ohlcv';

export default class MA10Strategy {
  private openedTrade = false;

  constructor() {
  }

  execute(ohlcvs: Ohlcv[]): void {
    const maLength = 10;
    const ma10 = MovingAverage.calculate(maLength, ohlcvs);

    const current = ohlcvs[ohlcvs.length - 1];
    const currentValue = current.close;

    if (currentValue > ma10 && !this.openedTrade) {
      console.log('BUY', current.getDate(), current.close, ma10);
      this.openedTrade = true;
      return;
    }

    if (currentValue < ma10 && this.openedTrade) {
      console.log('SELL', current.getDate(), current.close, ma10);
      this.openedTrade = false;
      return;
    }
  }
}
