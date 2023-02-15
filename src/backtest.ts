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
  strategies: Strategy[];
  start: number;
  end: number;

  constructor(tickTimeFrame: TimeFrame, strategies: Strategy[], start: number, end: number) {
    super(tickTimeFrame);
    this.ticker = strategies[0].ticker;
    this.strategies = strategies;
    this.start = start;
    this.end = end;
    console.log('start', timestampToString(start));
    console.log('end', timestampToString(end));
  }

  async launch() {
    const backtestExchangeService = new BacktestExchangeService(this.ticker, this.tickTimeFrame, this.start, this.end);
    await backtestExchangeService.init();

    const buyAndHoldPerformance = (backtestExchangeService.ohlcvs[backtestExchangeService.ohlcvs.length - 1].close / backtestExchangeService.ohlcvs[0].close
       - 1) * 100;

    Workspace.setExchange(this.ticker.exchangeId, backtestExchangeService);
    console.log('ticks', backtestExchangeService.ohlcvs.length);

    await this.strategyRepository.updateMultiple(this.strategies);

    while (backtestExchangeService.ohlcvs.length > 0) {
      await this.onTick();
    }

    const trades = await Workspace.tradeRepository.getAll();
    console.log('Trades taken', trades.length);
    PerformanceCalculator.getPerformance(trades);

    console.log('Buy & hold performance', `${buyAndHoldPerformance.toFixed(2)}%`);
  }
}
