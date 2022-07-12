import FakeWallet from '../fake-wallet';
import MovingAverage from '../indicators/moving-average';
import RelativeStrenghIndex from '../indicators/relative-strengh-index';
import Ohlcv from '../models/ohlcv';
import Strategy from './strategy';

export default class SmallMACrossBigMAStrategy implements Strategy {
  private waitForFirstSignal = true;
  private wallet: FakeWallet;
  private smallMaLength: number;
  private bigMaLength: number;

  constructor(wallet: FakeWallet, smallMaLength: number, bigMaLength: number) {
    this.wallet = wallet;
    this.smallMaLength = smallMaLength;
    this.bigMaLength = bigMaLength;
  }

  execute(timestamp: number, ohlcvs: Ohlcv[]): void {
    const smallMa = MovingAverage.calculate(this.smallMaLength, ohlcvs.map(x => x.close));
    const bigMa = MovingAverage.calculate(this.bigMaLength, ohlcvs.map(x => x.close));
    const rsi = RelativeStrenghIndex.calculate(ohlcvs.map(x => x.close));

    const current = ohlcvs[ohlcvs.length - 1];
    const currentValue = current.close;

    if (rsi > 55 && smallMa > bigMa && !this.wallet.hasTradeOpen && !this.waitForFirstSignal) {
      console.log(rsi, smallMa, bigMa, currentValue);
      this.wallet.buy(timestamp, currentValue);
      return;
    }

    // if (this.wallet.hasTradeOpen) {
    //   this.wallet.openTrade?.openOrder.price
    // }

    if (bigMa > smallMa) {
      this.waitForFirstSignal = false;
      if (this.wallet.hasTradeOpen) {
        this.wallet.sell(timestamp, currentValue);
      }
      return;
    }
  }
}
