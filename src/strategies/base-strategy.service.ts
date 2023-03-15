import ChartHelper from '../helpers/chart.helper';
import { IndicatorType } from '../indicators/indicator-type';
import IndicatorValue from '../indicators/indicator-value';
import Candlestick from '../models/candlestick';
import Trade from '../models/trade';
import PerformanceCalculator from '../performance/performance-calculator';
import Workspace from '../workspace/workspace';
import Strategy from './strategy';

export default abstract class BaseStrategyService {
  strategy: Strategy;

  private _currentTrade: Trade | undefined = undefined;
  private _currentTradeRetrieved = false;
  get currentTrade(): Trade | undefined {
    if (!this._currentTradeRetrieved) {
      this._currentTrade = this.strategy.currentTradeId ? 
        Workspace.store.trades.find(trade => trade.isOpen && trade.id === this.strategy.currentTradeId) : undefined;
      this._currentTradeRetrieved = true;
    }
    return this._currentTrade;
  }

  constructor(strategy: Strategy) {
    this.strategy = strategy;
  }

  abstract execute(): Promise<void>;

  getIndicatorValue<T = IndicatorValue>(indicatorType: IndicatorType): T {
    const { indicator, timeframe } = this.strategy.indicators.find(x => x.indicator.type === indicatorType) ?? {};
    if (!timeframe) throw new Error('Timeframe should be defined');
    if (!indicator) throw new Error(`Indicator of type ${indicatorType} should be defined`);

    const chart = Workspace.getChart(this.strategy.ticker, timeframe);
    if (!chart) throw new Error('Chart should be defined');

    const value = ChartHelper.getIndicatorValue(chart, 0, indicator);
    if (!value) throw new Error(`Value of indicator of type ${indicatorType} should be defined`);
    return value as T;
  }

  async closeCurrentTrade(): Promise<void> {
    if (!this.currentTrade) throw new Error('Close current trade cannot be called if no current trade open.');
    await Workspace.service.trade.closeTrade(this.currentTrade);
    this.onTradeClosed(this.currentTrade);
  }

  onTradeClosed(trade: Trade): void {
    if (trade.id !== this.strategy.currentTradeId) return;
    
    const pnl = PerformanceCalculator.getTradePerformance(trade)?.pnl ?? 0;
    this.strategy.currentTradeId = null;
    this.strategy.availableBalance += pnl,
    this.strategy.updated = true;
  }

  protected get currentCandlestick(): Candlestick {
    return this.getCandlestick();
  }

  protected getCandlestick(index: number = 0): Candlestick {
    const chart = Workspace.getChart(this.strategy.ticker);
    if (!chart) throw new Error('Chart should be defined');
    return chart.candlesticks[index];
  }

  protected get availableBalance(): number {
    return this.strategy.availableBalance;
  }
}