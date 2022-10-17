import TimeFrame from '../enums/timeframe';
import BollingerBands from '../indicators/bollinger-bands/bollinger-bands';
import MacdZeroLag from '../indicators/macd-zero-lag/macd-zero-lag';
import SMA from '../indicators/moving-average/sma';
import { Symbol } from '../models/symbol';
import Trade from '../models/trade';
import Strategy from './strategy';

export default class Reverse15mStrategy extends Strategy {
  private sma7 = new SMA(7);
  private macdZeroLag = new MacdZeroLag();
  private bb = new BollingerBands(20, 2.5);
  private currentTrade: Trade | null = null;

  constructor(symbol: Symbol) {
    super(symbol, [TimeFrame.t1m, TimeFrame.t5m, TimeFrame.t15m, TimeFrame.t1h]);
  }
 
  addIndicators(): void {
    this.chartWorkspace.get(TimeFrame.t1m)?.addIndicator(this.macdZeroLag);

    this.chartWorkspace.get(TimeFrame.t5m)?.addIndicator(this.macdZeroLag);
    this.chartWorkspace.get(TimeFrame.t5m)?.addIndicator(this.sma7);
    this.chartWorkspace.get(TimeFrame.t5m)?.addIndicator(this.bb);

    this.chartWorkspace.get(TimeFrame.t15m)?.addIndicator(this.bb);

    this.chartWorkspace.get(TimeFrame.t1h)?.addIndicator(this.bb);
  }

  async execute(): Promise<void> {
    if (!this.currentTrade?.isOpen) this.currentTrade = null;

    const currentCandlestick = this.chartWorkspace.get(TimeFrame.t1m)?.currentCandlestick;
    if (!currentCandlestick) return;

    const buySignal = this.bbFlat(TimeFrame.t1h) && this.bbFlat(TimeFrame.t15m) && this.bb5mFlatAndCloseLower() && 
      this.breaksSma7() &&
      this.optiReverse5mAnd15m();

    if (buySignal && !this.currentTrade) {
      console.log('>>>>>>>>>>>>>>>>> signal ', new Date(currentCandlestick.timestamp), currentCandlestick.close);
      this.currentTrade = Trade.openAtMarket(this.symbol, 1) // get quantity from wallet
      
      const tp1Price = currentCandlestick.close * 1.001;
      this.currentTrade.addTakeProfit(1, tp1Price);

      // const tp1Price = currentCandlestick.close * 1.001;
      // this.currentTrade.addTakeProfit(0.5, tp1Price);

      // const tp2Price = currentCandlestick.close * 1.002;
      // this.currentTrade.addTakeProfit(0.5, tp2Price);

      // const tp2Price = (bb1h.upper + bb1h.basis) / 2;
      // this.currentTrade.addTakeProfit(1, tp2Price);

      const slPrice = this.chartWorkspace.get(TimeFrame.t1h)?.getCandlestickFromEnd(-1)?.low ?? 0;
      this.currentTrade.addStopLoss(slPrice);
      // console.log('SL --- ', new Date(this.chartWorkspace.get(TimeFrame.t1h)?.getCandlestickFromEnd(-1)?.timestamp), slPrice)

      await this.tradeManager.create(this.currentTrade, currentCandlestick);
    }
  }

  private bbFlat(timeframe: TimeFrame): boolean {
    const bb = this.chartWorkspace.get(timeframe)?.currentCandlestick.getIndicatorValue(this.bb);
    return (bb && (bb.phase === 'flat' || bb.phase === 'narrowing')) || false;
  }

  private bb5mFlatAndCloseLower(): boolean {
    const bb = this.chartWorkspace.get(TimeFrame.t5m)?.currentCandlestick.getIndicatorValue(this.bb);
    return (bb && (bb.phase === 'flat' || bb.phase === 'narrowing') && bb.percentB < 0.3) || false;
  }

  private optiReverse5mAnd15m(): boolean {
    const macd1m = this.chartWorkspace.get(TimeFrame.t1m)?.currentCandlestick.getIndicatorValue(this.macdZeroLag);
    const macd5m = this.chartWorkspace.get(TimeFrame.t5m)?.currentCandlestick.getIndicatorValue(this.macdZeroLag);
    return (macd1m?.macdAboveSignal && macd5m?.macdAboveSignal) || false;
  }

  private breaksSma7(): boolean {
    const currentCandlestick = this.chartWorkspace.get(TimeFrame.t5m)?.currentCandlestick;
    if (!currentCandlestick) return false;
    const sma7 = currentCandlestick.getIndicatorValue(this.sma7);
    if (!sma7) return false;
    return currentCandlestick.close > sma7.value && sma7.direction === 'up';
  }
}