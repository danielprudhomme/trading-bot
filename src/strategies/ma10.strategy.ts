import FakeWallet from '../fake-wallet';
import MovingAverage from '../indicators/moving-average';
import Ohlcv from '../models/ohlcv';
import Strategy from './strategy';

export default class MA10Strategy implements Strategy {
  private waitForFirstSignal = true;
  private wallet: FakeWallet;

  constructor(wallet: FakeWallet) {
    this.wallet = wallet;
  }

  execute(timestamp: number, ohlcvs: Ohlcv[]): void {
    const maLength = 10;
    const ma10 = MovingAverage.calculate(maLength, ohlcvs.map(x => x.close));

    const current = ohlcvs[ohlcvs.length - 1];
    const currentValue = current.close;

    if (currentValue > ma10 && !this.wallet.hasTradeOpen && !this.waitForFirstSignal) {
      this.wallet.buy(timestamp, currentValue);
      return;
    }

    if (currentValue < ma10) {
      this.waitForFirstSignal = false;
      if (this.wallet.hasTradeOpen) {
        this.wallet.sell(timestamp, currentValue);
      }
      return;
    }
  }
}
