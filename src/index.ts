import BackTest from './backtest';
import { ConfigurationManager } from './config/configuration-manager';
import BacktestExchangeService from './infrastructure/exchange-service/backtest-exchange.service';
import { AssetSymbol } from './models/asset-symbol';
import Ticker from './models/ticker';
import PerformanceCalculator from './performance/performance-calculator';
import Strategy from './strategies/strategy';
import { trendSmaDailyStrategy } from './strategies/trend-sma-daily.strategy';
import { TimeFrame } from './timeframe/timeframe';
import Workspace from './workspace/workspace';

ConfigurationManager.load();

// const start = Date.UTC(2022, 0, 1);
const start = Date.UTC(2023, 1, 14);
const end = Date.UTC(2023, 1, 20);
// const end = Date.UTC(2023, 2, 3);
Workspace.init(true, true);

const initialAmount = 1000;

const ticker: Ticker = { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' };
const strategies: Strategy[] = [
  trendSmaDailyStrategy(ticker, initialAmount, '1h', 7 * 24, { length: 20, mult: 2 }, { length: 20, mult: 2.5 }, { factor: 3, atrPeriod: 10 })
];
const tickTimeFrame: TimeFrame = '1h';
// const fees = { maker: 0, taker: 0 };
const fees = { maker: 0.1 / 100, taker: 0.1 / 100 };
const exchangeService = new BacktestExchangeService(ticker, tickTimeFrame, start, end, fees);

const backtest = new BackTest(tickTimeFrame, strategies, start, end, exchangeService);
await backtest.launch();

const trades = await Workspace.repository.trade.getAll();
PerformanceCalculator.getPerformance(initialAmount, trades);

console.log('---> END');
