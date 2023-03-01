import TickerHelper from '../helpers/ticker.helper';
import IndicatorOnChart from '../indicators/indicator-on-chart';
import IndicatorHelper from '../indicators/indicator.helper';
import StrategyRepository from '../infrastructure/repositories/strategy/strategy.repository';
import ChartService from '../services/chart.service';
import TradeService from '../services/trade.service';
import StrategyServiceProvider from '../strategies/strategy-service-provider';
import { TimeFrame } from '../timeframe/timeframe';
import Workspace from '../workspace/workspace';

export default abstract class TradingWorker {
  protected tickTimeFrame: TimeFrame;

  constructor(tickTimeFrame: TimeFrame) {
    this.tickTimeFrame = tickTimeFrame;
  }

  protected get tradeService(): TradeService {
    return Workspace.service.trade;
  }

  protected get chartService(): ChartService {
    return Workspace.service.chart;
  }

  protected get strategyRepository(): StrategyRepository {
    return Workspace.repository.strategy;
  }
  
  async onTick() {
    // Get open trades
    Workspace.store.trades = await this.tradeService.getAllOpen();
    // Get running strategies
    Workspace.store.strategies = await this.strategyRepository.getAll();
    
    // Update chart with indicator needed on strategies
    const indicatorsOnChart = Workspace.store.strategies.reduce((indicators, strategy) => {
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
 
    // Synchronize trades with exchange (i.e. if limit orders have been completed)
    await this.synchronizeTradesWithExchange();

    // Execute strategies
    for (const strategy of Workspace.store.strategies) {
      await StrategyServiceProvider.get(strategy).execute();
    }

    // Update strategies and trades in DB
    await this.strategyRepository.updateMultiple(Workspace.store.strategies.filter(strategy => strategy.updated));
    await this.tradeService.persistUpdatedTrades(Workspace.store.trades);

    // Update balance when trades are closed
    await this.updateBalanceWhenTradesAreClosed();
  }

  private async synchronizeTradesWithExchange(): Promise<void> {
    for (const trade of Workspace.store.trades) {
      await this.tradeService.synchronizeWithExchange(trade);
    }
  }

  private async updateBalanceWhenTradesAreClosed() {
    // const exchangeGroups = trades
    //   .filter(trade => trade.isOpen)
    //   .reduce((pnlByExchange, trade) => {
    //     const tradePerf =  PerformanceCalculator.getTradePerformance(trade);
    //     if (!tradePerf) return pnlByExchange;

    //     const exchangeId = trade.ticker.exchangeId;

    //     // TODO : attention il faut aussi gérer les autres base Assets
    //     let currentPnl = pnlByExchange.get(exchangeId) ?? 0;
    //     currentPnl += tradePerf.pnl;

    //     pnlByExchange.set(exchangeId, currentPnl);

    //     return pnlByExchange;
    //   }, new Map<ExchangeId, number>());


    //   const lol = [...exchangeGroups].forEach(([exchangeId, pnl]) => {

    //   })

    
  }
}