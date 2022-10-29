import TimeFrame from '../enums/timeframe';
import ExchangeService from '../exchange-service/exchange.service';
import BollingerBands from '../indicators/bollinger-bands/bollinger-bands';
import BollingerBandsValue from '../indicators/bollinger-bands/bollinger-bands-value';
import Candlestick from '../models/candlestick';
import { Symbol } from '../models/symbol';
import Trade from '../models/trade';
import Strategy from './strategy';

export default class LowOutsideBBStrategy extends Strategy {
  private bollingerBands = new BollingerBands(20, 2.5);
  private readonly timeframe: TimeFrame;
  private currentTrade: Trade | null = null;

  private get currentCandlestick(): Candlestick {
    const candlestick = this.chartWorkspace.get(this.timeframe)?.currentCandlestick;
    if (!candlestick) throw new Error('Chart should have been defined for this timeframe.');
    return candlestick;
  }

  private get bb(): BollingerBandsValue {
    const bb = this.currentCandlestick.getIndicatorValue(this.bollingerBands);
    if (!bb) throw new Error('Bollinger bands should have been defined.');
    return bb;
  }

  constructor(symbol: Symbol, timeframe: TimeFrame) {
    super(symbol, [timeframe]);
    this.timeframe = timeframe;
  }
  
  addIndicators(): void {
    this.chartWorkspace.get(this.timeframe)?.addIndicator(this.bollingerBands);
  }

  async execute(exchangeService: ExchangeService): Promise<void> {
    if (!this.currentTrade?.isOpen) this.currentTrade = null;

    if (!this.currentTrade) {
      const buySignal = this.bbFlat && this.lowOutsideBB && this.closeInsideBB && this.lowWickIsLong;
  
      if (buySignal) {
        await this.openTrade(exchangeService);
      }
      
      return;
    }

    const sellSignal = this.priceTouchedSMA20;
    if (sellSignal) {
      await this.currentTrade.closeTrade(exchangeService);
    }
  }

  private get bbFlat(): boolean {
    return (this.bb.phase === 'flat' || this.bb.phase === 'narrowing');
  }

  private get lowOutsideBB(): boolean {
    return this.currentCandlestick.low <= this.bb.lower;
  }

  private get closeInsideBB(): boolean {
    return this.currentCandlestick.close >= this.bb.lower;
  }

  private get lowWickIsLong(): boolean {
    return this.currentCandlestick.lowWickSize * 100 > 0.3;
  }

  private get priceTouchedSMA20(): boolean {
    const high = this.currentCandlestick.high;
    const sma = this.bb.basis;
    return high >= sma;
  }

  private async openTrade(exchangeService: ExchangeService): Promise<void> {
    const currentCandlestick = this.chartWorkspace.get(this.timeframe)?.currentCandlestick;
    if (!currentCandlestick) return;

    this.currentTrade = Trade.openTrade(
      currentCandlestick,
      exchangeService,
      this.symbol,
      1,
      // null,
      [
        { quantity: 0.5, price: currentCandlestick.close * 1.005 },
      ],
      this.currentCandlestick.low,
      { condition: 'tp1', newPosition: 'breakEven' }
    );
    
    await this.tradeManager.add(this.currentTrade);
  }
}