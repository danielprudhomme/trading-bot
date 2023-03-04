import { timestampToString } from './helpers/date';
import BacktestExchangeService from './infrastructure/exchange-service/backtest-exchange.service';
import Ticker from './models/ticker';
import PerformanceCalculator from './performance/performance-calculator';
import Strategy from './strategies/strategy';
import { TimeFrame } from './timeframe/timeframe';
import TradingWorker from './trading-worker/trading-worker';
import Workspace from './workspace/workspace';

export default class BackTest extends TradingWorker {
  ticker: Ticker;
  strategies: Strategy[];
  start: number;
  end: number;
  exchangeService: BacktestExchangeService;

  constructor(tickTimeFrame: TimeFrame, strategies: Strategy[], start: number, end: number, exchangeService: BacktestExchangeService) {
    super(tickTimeFrame);
    this.ticker = strategies[0].ticker;
    this.strategies = strategies;
    this.start = start;
    this.end = end;
    this.exchangeService = exchangeService;
    console.log('start', timestampToString(start));
    console.log('end', timestampToString(end));
  }

  async launch() {
    await this.exchangeService.init();

    const buyAndHoldPerformance = (
        this.exchangeService.ohlcvs[this.exchangeService.ohlcvs.length - 1].close
        / this.exchangeService.ohlcvs[0].close - 1
      ) * 100;

    Workspace.setExchange(this.ticker.exchangeId, this.exchangeService);
    console.log('ticks', this.exchangeService.ohlcvs.length);

    await this.strategyRepository.updateMultiple(this.strategies);

    while (this.exchangeService.ohlcvs.length > 0) {
      await this.onTick();
    }

    const trades = await Workspace.repository.trade.getAll();
    console.log('Trades taken', trades.length);
    PerformanceCalculator.getPerformance(trades);

    Workspace.store.strategies.forEach(x => console.log('End balance', x.availableBalance));

    console.log('Buy & hold performance', `${buyAndHoldPerformance.toFixed(2)}%`);
  }
}
