import Candlestick from '../models/candlestick';
import Trade from '../models/trade';
import PerformanceCalculator from '../performance/performance-calculator';
import Workspace from '../workspace/workspace';
import Strategy from './strategy';

export default abstract class BaseStrategyService {
  strategy: Strategy;

  constructor(strategy: Strategy) {
    this.strategy = strategy;
  }

  abstract execute(): Promise<void>;

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