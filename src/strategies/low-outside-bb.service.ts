import ChartHelper from '../helpers/chart.helper';
import BollingerBandsValue from '../indicators/bollinger-bands/bollinger-bands-value';
import Trade from '../models/trade';
import TradeService from '../services/trade.service';
import Workspace from '../workspace';
import BaseStrategyService from './base-strategy.service';
import LowOutsideBBStrategy from './low-outside-bb.strategy';

export default class LowOutsideBBService extends BaseStrategyService {

  constructor(strategy: LowOutsideBBStrategy) {
    super(strategy);
  }

  private get bb(): BollingerBandsValue {
    const { indicator: bb, timeframe } = this.strategy.indicators.find(x => x.indicator.type === 'bb') ?? {};
    if (!timeframe) throw new Error('Timeframe should be defined');
    if (!bb) throw new Error('BB should be defined');

    const chart = Workspace.getChart(this.strategy.ticker, timeframe);
    if (!chart) throw new Error('Chart should be defined');

    const value = ChartHelper.getIndicatorValue(chart, 0, bb);
    if (!value) throw new Error('Bollinger bands value should be defined');
    return value as BollingerBandsValue;
  }

  private get tradeService(): TradeService {
    return Workspace.tradeService;
  }

  async execute(trades: Trade[]): Promise<void> {
    const currentTrade: Trade | null = this.strategy.currentTradeId ? trades.find(trade => trade.isOpen && trade.id === this.strategy.currentTradeId) ?? null : null;

    if (!currentTrade) {
      const buySignal =this.currentCandlestick.isClosed && this.bbFlat && this.lowOutsideBB && this.closeInsideBB && this.lowWickIsLong;

      if (buySignal) {
        const trade = await this.openTrade();
        trades.push(trade);
        this.strategy.currentTradeId = trade.id;
        this.strategy.updated = true;
      }
      
      return;
    }

    const sellSignal = currentTrade && this.priceTouchedSMA20;
    if (sellSignal) {
      await this.tradeService.closeTrade(currentTrade);
      this.strategy.currentTradeId = null;
      this.strategy.updated = true;
    }
  }

  private get bbFlat(): boolean {
    return this.bb.phase === 'flat' || this.bb.phase === 'narrowing';
  }

  private get lowOutsideBB(): boolean {
    return this.currentCandlestick.low <= this.bb.lower;
  }

  private get closeInsideBB(): boolean {
    return this.currentCandlestick.close >= this.bb.lower;
  }

  private get lowWickIsLong(): boolean {
    return ChartHelper.getLowWickSize(this.currentCandlestick) * 100 > 0.3;
  }

  private get priceTouchedSMA20(): boolean {
    const high = this.currentCandlestick.high;
    const sma = this.bb.basis;
    return high >= sma;
  }

  private async openTrade(): Promise<Trade> {
    const trade = await this.tradeService.openTrade(
      this.strategy.ticker,
      1,
      [
        { quantity: 0.5, price: this.currentCandlestick.close * 1.005 },
      ],
      this.currentCandlestick.low,
      { condition: 'tp1', newPosition: 'breakEven' });
    
    this.strategy.currentTradeId = trade.id;
    return trade;
  }
}