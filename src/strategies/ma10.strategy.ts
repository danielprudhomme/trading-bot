import FakeWallet from '../fake-wallet';
import MovingAverage from '../indicators/moving-average';
import Ohlcv from '../models/ohlcv';

export default class MA10Strategy {
  private waitForFirstSignal = true;
  private openedTrade = false;
  private wallet: FakeWallet;

  constructor(wallet: FakeWallet) {
    this.wallet = wallet;
  }

  execute(timestamp: number, ohlcvs: Ohlcv[]): void {
    const maLength = 10;
    const ma10 = MovingAverage.calculate(maLength, ohlcvs);

    const current = ohlcvs[ohlcvs.length - 1];
    const currentValue = current.close;

    if (currentValue > ma10 && !this.openedTrade && !this.waitForFirstSignal) {
      this.wallet.buy(timestamp, currentValue);
      this.openedTrade = true;
      return;
    }

    if (currentValue < ma10) {
      this.waitForFirstSignal = false;
      if (this.openedTrade) {
        this.wallet.sell(timestamp, currentValue);
        this.openedTrade = false;
      }
      return;
    }
  }
}
