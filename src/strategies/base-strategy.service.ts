import Candlestick from '../models/candlestick';
import Trade from '../models/trade';
import Workspace from '../workspace';
import Strategy from './strategy';

export default abstract class BaseStrategyService {
  strategy: Strategy;

  constructor(strategy: Strategy) {
    this.strategy = strategy;
  }

  abstract execute(trades: Trade[]): Promise<void>;

  protected get currentCandlestick(): Candlestick {
    return this.getCandlestick();
  }

  protected getCandlestick(index: number = 0): Candlestick {
    const chart = Workspace.getChart(this.strategy.ticker);
    if (!chart) throw new Error('Chart should be defined');
    return chart.candlesticks[index];
  }
}