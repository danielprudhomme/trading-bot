import TimeFrame from '../enums/timeframe';
import BollingerBands from '../indicators/bollinger-bands/bollinger-bands';
import MacdZeroLag from '../indicators/macd-zero-lag/macd-zero-lag';
import SMA from '../indicators/moving-average/sma';
import { Symbol } from '../models/symbol';
import Trade from '../models/trade';
import Strategy from './strategy';

export default class OptiStrategy extends Strategy {
  private sma = new SMA(20);
  private macdZeroLag = new MacdZeroLag();
  private bb = new BollingerBands(20, 2.5);
  private ongoingSignal = false;

  constructor(symbol: Symbol) {
    super(symbol, [TimeFrame.t5m, TimeFrame.t15m, TimeFrame.t1h, TimeFrame.t1d]);
  }

  addIndicators(): void {
    for (const timeframe of [TimeFrame.t5m, TimeFrame.t15m, TimeFrame.t1h]) {
      this.chartWorkspace.get(timeframe)?.addIndicator(this.sma);
      this.chartWorkspace.get(timeframe)?.addIndicator(this.macdZeroLag);
    }

    this.chartWorkspace.get(TimeFrame.t1d)?.addIndicator(this.bb);
  }

  async execute(): Promise<void> {
    const currentCandlestick = this.chartWorkspace.get(TimeFrame.t1d)?.currentCandlestick;
    if (!currentCandlestick) return;

    const currentPrice = currentCandlestick.close;
    const bb1d = this.chartWorkspace.get(TimeFrame.t1d)?.currentCandlestick.getIndicatorValue(this.bb);

    const buySignal = bb1d && (bb1d.phase == 'flat' || bb1d.phase == 'narrowing') &&
      this.opti();
    // const buySignal = currentPrice < 1295 && currentPrice > 1244 &&
    //   bb1d && (bb1d.phase == 'flat' || bb1d.phase == 'narrowing') &&
    //   this.opti();

    if (this.ongoingSignal && !buySignal) {
      this.ongoingSignal = false;
    }

    if (!this.ongoingSignal && buySignal) {
      console.log('%b', bb1d.percentB, currentCandlestick.close, bb1d.lower, bb1d.upper, (currentCandlestick.close - bb1d.lower) / (bb1d.upper - bb1d.lower))
      this.ongoingSignal = true;
      console.log('>>>>>>>>>>>>>>>>> signal ', new Date(currentCandlestick.timestamp), currentCandlestick.close);
      const currentTrade = Trade.openAtMarket(this.symbol, 1) // get quantity from wallet
      
      // TP1 at +0,5%
      const tp1Price = currentCandlestick.close * 1.01;
      currentTrade.addTakeProfit(1, tp1Price);

      const slPrice = currentCandlestick.low;
      currentTrade.addStopLoss(slPrice);

      await this.tradeManager.create(currentTrade, currentCandlestick);
    }
  }

  private opti(): boolean {
    let opti = false;
    for (const timeframe of [TimeFrame.t5m, TimeFrame.t15m, TimeFrame.t1h]) {
      const chart = this.chartWorkspace.get(timeframe);

      const sma = chart?.currentCandlestick.getIndicatorValue(this.sma);
      const macdZeroLag = chart?.currentCandlestick.getIndicatorValue(this.macdZeroLag);

      opti = (sma?.direction === 'up' && macdZeroLag?.macdAboveSignal) ?? false;

      if (!opti) break;
    }
    return opti;
  }
}