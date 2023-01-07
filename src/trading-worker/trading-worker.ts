import TickerHelper from '../helpers/ticker.helper';
import IndicatorOnChart from '../indicators/indicator-on-chart';
import IndicatorHelper from '../indicators/indicator.helper';
import StrategyRepository from '../infrastructure/repositories/strategy.repository';
import Trade from '../models/trade';
import ChartService from '../services/chart.service';
import TradeService from '../services/trade.service';
import StrategyServiceProvider from '../strategies/strategy-service-provider';
import { TimeFrame } from '../timeframe/timeframe';
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

  protected get strategyRepository(): StrategyRepository {
    return Workspace.strategyRepository;
  }
  
  async onTick() {
    const trades = await this.tradeService.getAllOpen();
    const strategies = await this.strategyRepository.getAll();
    
    const indicatorsOnChart = strategies.reduce((indicators, strategy) => {
      strategy.indicators.forEach(({ indicator, timeframe }) => {
        const alreadyAdded = indicators.findIndex(x =>
            TickerHelper.areEqual(x.ticker, strategy.ticker) &&
            x.timeframe === timeframe &&
            IndicatorHelper.areEqual(x.indicator, indicator)
          ) > -1;
        if (!alreadyAdded) indicators.push({ indicator, timeframe, ticker: strategy.ticker });
      });
      return indicators;
    }, [] as IndicatorOnChart[]);
    await this.chartService.fetchAndUpdate(indicatorsOnChart, this.tickTimeFrame);
 
    await this.synchronizeTradesWithExchange(trades);

    for (const strategy of strategies) {
      await StrategyServiceProvider.get(strategy).execute(trades);
    }

    await this.tradeService.persistUpdatedTrades(trades);
  }

  private async synchronizeTradesWithExchange(trades: Trade[]): Promise<void> {
    for (const trade of trades) {
      await this.tradeService.synchronizeWithExchange(trade);
    }
  }
}