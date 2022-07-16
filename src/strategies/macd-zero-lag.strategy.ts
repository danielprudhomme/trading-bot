import Strategy from './strategy';

export default class MACDZeroLagStrategy extends Strategy {
  private waitForFirstSignal = true;

  execute(timestamp: number): void {
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
