import FakeWallet from '../fake-wallet';
import { MacdZeroLag } from '../indicators/macd-zero-lag';
import Ohlcv from '../models/ohlcv';
import Strategy from './strategy';

export default class MACDZeroLagStrategy implements Strategy {
  private waitForFirstSignal = true;
  private wallet: FakeWallet;

  constructor(wallet: FakeWallet) {
    this.wallet = wallet;
  }

  execute(timestamp: number, ohlcvs: Ohlcv[]): void {
    const macdZeroLag = MacdZeroLag.calculate(ohlcvs.map(x => x.close));
    const macdAboveSignal = macdZeroLag.macdAboveSignal[macdZeroLag.macdAboveSignal.length - 1];

    const current = ohlcvs[ohlcvs.length - 1];
    const currentValue = current.close;

    if (macdAboveSignal && !this.wallet.hasTradeOpen && !this.waitForFirstSignal) {
      this.wallet.buy(timestamp, currentValue);
      return;
    }

    if (!macdAboveSignal) {
      this.waitForFirstSignal = false;
      if (this.wallet.hasTradeOpen) {
        this.wallet.sell(timestamp, currentValue);
      }
      return;
    }
  }
}
