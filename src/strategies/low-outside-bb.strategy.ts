import { Guid } from 'guid-typescript';
import TimeFrame from '../enums/timeframe';
import BollingerBands from '../indicators/bollinger-bands/bollinger-bands';
import BollingerBandsValue from '../indicators/bollinger-bands/bollinger-bands-value';
import Candlestick from '../models/candlestick';
import Ticker from '../models/ticker';
import Trade from '../models/trade';
import Workspace from '../workspace';
import Strategy from './strategy';

export default class LowOutsideBBStrategy extends Strategy {
  private bollingerBands = new BollingerBands(20, 2.5);
  private readonly timeframe: TimeFrame;
  private currentTradeId: Guid | null = null;

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

  constructor(ticker: Ticker, timeframe: TimeFrame) {
    super(ticker, [timeframe]);
    this.timeframe = timeframe;
  }
  
  addIndicators(): void {
    this.chartWorkspace.get(this.timeframe)?.addIndicator(this.bollingerBands);
  }

  async execute(): Promise<void> {
    const currentTrade: Trade | null = this.currentTradeId ? await Workspace.getTradeRepository().getById(this.currentTradeId) : null;
    if (!currentTrade?.isOpen) this.currentTradeId = null;

    if (!currentTrade) {
      const buySignal = this.bbFlat && this.lowOutsideBB && this.closeInsideBB && this.lowWickIsLong;
  
      if (buySignal) {
        await this.openTrade();
      }
      
      return;
    }

    const sellSignal = this.priceTouchedSMA20;
    if (sellSignal) {
      await currentTrade.closeTrade();
      await this.tradeRepository.set(currentTrade);
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

  private async openTrade(): Promise<void> {
    const currentCandlestick = this.chartWorkspace.get(this.timeframe)?.currentCandlestick;
    if (!currentCandlestick) return;

    const trade = await Trade.openTrade(
      currentCandlestick,
      this.ticker,
      1,
      // null,
      [
        { quantity: 0.5, price: currentCandlestick.close * 1.005 },
      ],
      this.currentCandlestick.low,
      { condition: 'tp1', newPosition: 'breakEven' }
    );

    await this.tradeRepository.set(trade);

    this.currentTradeId = trade.id;
  }
}