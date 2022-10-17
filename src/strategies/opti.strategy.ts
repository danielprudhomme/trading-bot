import TimeFrame from '../enums/timeframe';
import BollingerBands from '../indicators/bollinger-bands/bollinger-bands';
import MacdZeroLag from '../indicators/macd-zero-lag/macd-zero-lag';
import SMA from '../indicators/moving-average/sma';
import { Symbol } from '../models/symbol';
import Trade from '../models/trade';
import Strategy from './strategy';

export default class OptiStrategy extends Strategy {
  private readonly smallTimeframes;
  private readonly bigTimeframe;

  private sma = new SMA(20);
  private macdZeroLag = new MacdZeroLag();
  private bb = new BollingerBands(20, 2.5);
  private ongoingSignal = false;
  private currentTrade: Trade | null = null;

  constructor(symbol: Symbol) {
    const smallTimeframes = [TimeFrame.t1m, TimeFrame.t5m];
    const bigTimeframe = TimeFrame.t1h;
    super(symbol, [...smallTimeframes, bigTimeframe]);
    this.smallTimeframes = smallTimeframes;
    this.bigTimeframe = bigTimeframe;
  }
 
  addIndicators(): void {
    for (const timeframe of this.smallTimeframes) {
      this.chartWorkspace.get(timeframe)?.addIndicator(this.sma);
      this.chartWorkspace.get(timeframe)?.addIndicator(this.macdZeroLag);
    }

    this.chartWorkspace.get(this.bigTimeframe)?.addIndicator(this.bb);
  }

  async execute(): Promise<void> {
    if (!this.currentTrade?.isOpen) this.currentTrade = null;

    const currentCandlestick = this.chartWorkspace.get(this.smallTimeframes[0])?.currentCandlestick;
    if (!currentCandlestick) return;

    const bb1d = this.chartWorkspace.get(this.bigTimeframe)?.currentCandlestick.getIndicatorValue(this.bb);

    const buySignal = bb1d && bb1d.percentB < 0.5 && (bb1d.phase == 'flat' || bb1d.phase == 'narrowing') &&
      this.opti();
    // const buySignal = currentPrice < 1295 && currentPrice > 1244 &&
    //   bb1d && (bb1d.phase == 'flat' || bb1d.phase == 'narrowing') &&
    //   this.opti();

    if (this.ongoingSignal && !buySignal) {
      this.ongoingSignal = false;
    }

    if (!this.ongoingSignal && buySignal && !this.currentTrade) {
      this.ongoingSignal = true;
      console.log('>>>>>>>>>>>>>>>>> signal ', new Date(currentCandlestick.timestamp), currentCandlestick.close);
      this.currentTrade = Trade.openAtMarket(this.symbol, 1) // get quantity from wallet
      
      const tp1Price = currentCandlestick.close * 1.01;
      this.currentTrade.addTakeProfit(1, tp1Price);

      // const tp1Price = currentCandlestick.close * 1.01;
      // this.currentTrade.addTakeProfit(0.5, tp1Price);

      // const tp2Price = currentCandlestick.close * 1.02;
      // this.currentTrade.addTakeProfit(0.5, tp2Price);

      // const tp2Price = (bb1d.upper + bb1d.basis) / 2;
      // this.currentTrade.addTakeProfit(1, tp2Price);

      const slPrice = this.chartWorkspace.get(this.bigTimeframe)?.getCandlestickFromEnd(-1)?.low ?? 0;
      this.currentTrade.addStopLoss(slPrice);

      await this.tradeManager.create(this.currentTrade, currentCandlestick);
    }
  }

  private opti(): boolean {
    let opti = false;
    for (const timeframe of this.smallTimeframes) {
      const chart = this.chartWorkspace.get(timeframe);

      const sma = chart?.currentCandlestick.getIndicatorValue(this.sma);
      const macdZeroLag = chart?.currentCandlestick.getIndicatorValue(this.macdZeroLag);

      opti = (sma?.direction === 'up' && macdZeroLag?.macdAboveSignal) ?? false;

      if (!opti) break;
    }
    return opti;
  }
}