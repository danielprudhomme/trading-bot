import TimeFrame from '../enums/timeframe';
import Trade from '../models/trade';
import ChartService from '../services/chart.service';
import TradeService from '../services/trade.service';
import StrategyPerformerProvider from '../strategies/strategy-performer-provider';
import StrategyService from '../strategies/strategy.service';
import Workspace from '../workspace';

export default abstract class TradingWorker {
  protected tickTimeFrame: TimeFrame;

  constructor(tickTimeFrame: TimeFrame) {
    this.tickTimeFrame = tickTimeFrame;
  }

  protected get tradeService(): TradeService {
    return Workspace.tradeService;
  }

  protected get chartService(): ChartService {
    return Workspace.chartService;
  }

  protected get strategyService(): StrategyService {
    return Workspace.strategyService;
  }
  
  async onTick() {
    const trades = await this.tradeService.getAllOpen();
    const strategies = await this.strategyService.getAll();
    
    await this.chartService.fetchAll();
    this.chartService.addStrategyIndicators(strategies);
    await this.chartService.updateAllWithExchange(this.tickTimeFrame);

    await this.synchronizeTradesWithExchange(trades);

    strategies.forEach(strategy => StrategyPerformerProvider.get(strategy).execute(trades));

    await this.tradeService.persistUpdatedTrades(trades);
  }

  private async synchronizeTradesWithExchange(trades: Trade[]): Promise<void> {
    for (const trade of trades) {
      await this.tradeService.synchronizeWithExchange(trade);
    }
  }
}