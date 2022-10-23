import TimeFrame from '../enums/timeframe';
import ExchangeService from '../exchange-service/exchange.service';
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

  async execute(exchangeService: ExchangeService): Promise<void> {
    if (!this.currentTrade?.isOpen) this.currentTrade = null;
    if (this.currentTrade) return;
    if (!this.macdBreaksSignal && !this.waitForMacdToBreak) this.waitForMacdToBreak = true;

    const buySignal = this.waitForMacdToBreak && this.macdBreaksSignal && this.bbFlatAndCloseLower;

    if (buySignal) {
      this.waitForMacdToBreak = false;
      await this.openTrade(exchangeService);
    }
  }

  private get bbFlatAndCloseLower(): boolean {
    return (this.bb.phase === 'flat' || this.bb.phase === 'narrowing') && this.bb.percentB < 0.4;
  }

  private get macdBreaksSignal(): boolean {
    return this.macdzl.macdAboveSignal && this.macdzl.value < 0;
  }

  private async openTrade(exchangeService: ExchangeService): Promise<void> {
    const currentCandlestick = this.chartWorkspace.get(this.timeframe)?.currentCandlestick;
    if (!currentCandlestick) return;

    this.currentTrade = Trade.openTrade(
      currentCandlestick,
      exchangeService,
      this.symbol,
      1,
      [
        { quantity: 1, price: currentCandlestick.close * 1.01 },
      ],
      this.chartWorkspace.get(this.timeframe)?.getCandlestickFromEnd(-1)?.low
    );
    
    await this.tradeManager.add(this.currentTrade);
  }
}