import TimeFrame from '../enums/timeframe';
import BollingerBands from '../indicators/bollinger-bands/bollinger-bands';
import BollingerBandsValue from '../indicators/bollinger-bands/bollinger-bands-value';
import Candlestick from '../models/candlestick-old';
import Ticker from '../models/ticker';
import Trade from '../models/trade';
import TradeService from '../services/trade.service';
import Workspace from '../workspace';
import StrategyPerformerService from './strategy-performer.service';

export default class LowOutsideBBService extends StrategyPerformerService {

  private bollingerBands = new BollingerBands(20, 2.5);
  private readonly timeframe: TimeFrame;
  private currentTradeId: string | null = null;

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

  private get tradeService(): TradeService {
    return Workspace.tradeService;
  }

  constructor(ticker: Ticker, timeframe: TimeFrame) {
    super(ticker, [timeframe]);
    this.timeframe = timeframe;
  }
  
  addIndicators(): void {
    this.chartWorkspace.get(this.timeframe)?.addIndicator(this.bollingerBands);
  }

  async execute(trades: Trade[]): Promise<void> {
    const currentTrade: Trade | null = this.currentTradeId ? trades.find(trade => trade.id === this.currentTradeId) ?? null : null;
    
    if (!currentTrade) {
      this.currentTradeId = null;
      const buySignal = this.bbFlat && this.lowOutsideBB && this.closeInsideBB && this.lowWickIsLong;
  
      if (buySignal) {
        trades.push(await this.openTrade());
      }
      
      return;
    }

    const sellSignal = this.priceTouchedSMA20;
    if (sellSignal) this.tradeService.closeTrade(currentTrade, this.currentCandlestick.close);
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

  private async openTrade(): Promise<Trade> {
    const currentCandlestick = this.chartWorkspace.get(this.timeframe)?.currentCandlestick;
    if (!currentCandlestick) throw new Error('Should have a current candlestick.');

    const trade = await this.tradeService.openTrade(
      this.ticker,
      1,
      [
        { quantity: 0.5, price: currentCandlestick.close * 1.005 },
      ],
      this.currentCandlestick.low,
      { condition: 'tp1', newPosition: 'breakEven' });
    
    this.currentTradeId = trade.id;

    return trade;
  }
}