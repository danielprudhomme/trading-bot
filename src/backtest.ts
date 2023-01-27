import { timestampToString } from './helpers/date';
import BacktestExchangeService from './infrastructure/exchange-service/backtest-exchange.service';
import Ticker from './models/ticker';
import PerformanceCalculator from './performance-calculator';
import Strategy from './strategies/strategy';
import { TimeFrame } from './timeframe/timeframe';
import TradingWorker from './trading-worker/trading-worker';
import Workspace from './workspace';

export default class BackTest extends TradingWorker {
  ticker: Ticker;
  strategy: Strategy;
  start: number;
  end: number;

  constructor(tickTimeFrame: TimeFrame, strategy: Strategy, start: number, end: number) {
    super(tickTimeFrame);
    this.ticker = strategy.ticker;
    this.strategy = strategy;
    this.start = start;
    this.end = end;
    console.log('start', timestampToString(start));
    console.log('end', timestampToString(end));
  }

  async launch() {
    const backtestExchangeService = new BacktestExchangeService(this.ticker, this.tickTimeFrame, this.start, this.end);
    await backtestExchangeService.init();
    Workspace.setExchange(this.ticker.exchangeId, backtestExchangeService);
    console.log('ticks', backtestExchangeService.ohlcvs.length);

    await this.strategyRepository.addOrUpdate(this.strategy);

    while (backtestExchangeService.ohlcvs.length > 0) {
      await this.onTick();
    }

    const trades = await Workspace.tradeRepository.getAll();
    console.log('Trades taken', trades.length);
    PerformanceCalculator.getPerformance(trades);
  }
}
