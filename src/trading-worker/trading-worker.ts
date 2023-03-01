import TickerHelper from '../helpers/ticker.helper';
import IndicatorOnChart from '../indicators/indicator-on-chart';
import IndicatorHelper from '../indicators/indicator.helper';
import StrategyRepository from '../infrastructure/repositories/strategy/strategy.repository';
import Trade from '../models/trade';
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
    return Workspace.tradeService;
  }

  protected get chartService(): ChartService {
    return Workspace.chartService;
  }

  protected get strategyRepository(): StrategyRepository {
    return Workspace.strategyRepository;
  }
  
  async onTick() {
    // Get open trades
    let trades = await this.tradeService.getAllOpen();
    // Get running strategies
    const strategies = await this.strategyRepository.getAll();
    
    // Update chart with indicator needed on strategies
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
 
    // Synchronize trades with exchange (i.e. if limit orders have been completed)
    await this.synchronizeTradesWithExchange(trades);

    // Execute strategies
    for (const strategy of strategies) {
      await StrategyServiceProvider.get(strategy).execute(trades);
    }

    // Update strategies and trades in DB
    await this.strategyRepository.updateMultiple(strategies.filter(strategy => strategy.updated));
    await this.tradeService.persistUpdatedTrades(trades);

    // Update balance when trades are closed
    await this.updateBalanceWhenTradesAreClosed(trades);
  }

  private async synchronizeTradesWithExchange(trades: Trade[]): Promise<void> {
    for (const trade of trades) {
      await this.tradeService.synchronizeWithExchange(trade);
    }
  }

  private async updateBalanceWhenTradesAreClosed(trades: Trade[]) {
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