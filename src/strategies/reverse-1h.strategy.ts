import TimeFrame from '../enums/timeframe';
import BollingerBands from '../indicators/bollinger-bands/bollinger-bands';
import BollingerBandsValue from '../indicators/bollinger-bands/bollinger-bands-value';
import MacdZeroLag from '../indicators/macd-zero-lag/macd-zero-lag';
import MacdZeroLagValue from '../indicators/macd-zero-lag/macd-zero-lag-value';
import { Symbol } from '../models/symbol';
import Trade from '../models/trade';
import Strategy from './strategy';

export default class Reverse1hStrategy extends Strategy {
  private macdZeroLag = new MacdZeroLag();
  private bollingerBands = new BollingerBands(20, 2.5);
  private readonly timeframe: TimeFrame;
  private currentTrade: Trade | null = null;
  private waitForMacdToBreak = false;

  private get macdzl(): MacdZeroLagValue {
    const macd = this.chartWorkspace.get(this.timeframe)?.currentCandlestick.getIndicatorValue(this.macdZeroLag);
    if (!macd) throw new Error('MACD Zero lag should have been defined.');
    return macd;
  }

  private get bb(): BollingerBandsValue {
    const bb = this.chartWorkspace.get(this.timeframe)?.currentCandlestick.getIndicatorValue(this.bollingerBands);
    if (!bb) throw new Error('Bollinger bands should have been defined.');
    return bb;
  }

  constructor(symbol: Symbol, timeframe: TimeFrame) {
    super(symbol, [timeframe]);
    this.timeframe = timeframe;
  }
 
  addIndicators(): void {
    this.chartWorkspace.get(this.timeframe)?.addIndicator(this.bollingerBands);
    this.chartWorkspace.get(this.timeframe)?.addIndicator(this.macdZeroLag);
  }

  async execute(): Promise<void> {
    if (!this.currentTrade?.isOpen) this.currentTrade = null;
    if (this.currentTrade) return;
    if (!this.macdBreaksSignal && !this.waitForMacdToBreak) this.waitForMacdToBreak = true;

    const buySignal = this.waitForMacdToBreak && this.macdBreaksSignal && this.bbFlatAndCloseLower;

    if (buySignal) {
      this.waitForMacdToBreak = false;
      await this.openTrade();
    }
  }

  private get bbFlatAndCloseLower(): boolean {
    return (this.bb.phase === 'flat' || this.bb.phase === 'narrowing') && this.bb.percentB < 0.4;
  }

  private get macdBreaksSignal(): boolean {
    return this.macdzl.macdAboveSignal && this.macdzl.value < 0;
  }

  private async openTrade(): Promise<void> {
    const currentCandlestick = this.chartWorkspace.get(this.timeframe)?.currentCandlestick;
    if (!currentCandlestick) return;
    
    this.currentTrade = Trade.openAtMarket(this.symbol, 1) // get quantity from wallet
        
    const tp1Price = currentCandlestick.close * 1.01;
    this.currentTrade.addTakeProfit(1, tp1Price);

    // const tp1Price = currentCandlestick.close * 1.001;
    // this.currentTrade.addTakeProfit(0.5, tp1Price);

    // const tp2Price = currentCandlestick.close * 1.002;
    // this.currentTrade.addTakeProfit(0.5, tp2Price);

    // const tp2Price = (bb1h.upper + bb1h.basis) / 2;
    // this.currentTrade.addTakeProfit(1, tp2Price);

    const slPrice = this.chartWorkspace.get(this.timeframe)?.getCandlestickFromEnd(-1)?.low ?? 0;
    this.currentTrade.addStopLoss(slPrice);

    await this.tradeManager.create(this.currentTrade, currentCandlestick);
  }
}