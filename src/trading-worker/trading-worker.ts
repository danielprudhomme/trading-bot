import TimeFrame from '../enums/timeframe';
import TradeRepository from '../infrastructure/repositories/trade-repository';
import ChartWorkspace from '../models/chart-workspace';
import { OHLCV } from '../models/ohlcv';
import Trade from '../models/trade';
import Strategy from '../strategies/strategy';
import Workspace from '../workspace';

export default abstract class TradingWorker {
  protected tickTimeFrame: TimeFrame;
  protected strategy: Strategy;

  protected _chartWorkspace: ChartWorkspace | null = null;
  protected get chartWorkspace(): ChartWorkspace {
    if (!this._chartWorkspace) throw new Error('ChartWorkspace should not be null.');
    return this._chartWorkspace;
  }

  constructor(tickTimeFrame: TimeFrame, strategy: Strategy) {
    this.tickTimeFrame = tickTimeFrame;
    this.strategy = strategy;
  }

  protected get tradeRepository(): TradeRepository {
    return Workspace.getTradeRepository();
  }

  async init(): Promise<void> {
    console.log('Trading worker - chart workspace init start !');
    this._chartWorkspace = await this.initChartWorkspace(this.strategy.timeframes);
    console.log('Trading worker - chart workspace init done !');
    this.strategy.init(this.chartWorkspace);
  }

  protected abstract initChartWorkspace(timeframes: TimeFrame[]): Promise<ChartWorkspace>;

  async launch(): Promise<void> {
    // CRON qui appelle onTick toutes les x secondes
    // override si backtest
  }

  async onTick() {
    const trades = await this.tradeRepository.getAllOpen();

    const lastOhlcv = await this.fetchLastOHLCV();
    this.chartWorkspace.newOHLCV(lastOhlcv);

    await this.synchronizeTradesWithExchange(trades, lastOhlcv.close);

    // execute strategy
    await this.strategy.execute();
  }

  private async synchronizeTradesWithExchange(trades: Trade[], currentPrice: number): Promise<void> {
    for (const trade of trades) {
      await trade.synchronizeWithExchange(currentPrice);
      await this.tradeRepository.set(trade);
    }
  }

  protected abstract fetchLastOHLCV(): Promise<OHLCV>;
}