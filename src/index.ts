import BackTest from './backtest';
import { ConfigurationManager } from './config/configuration-manager';
import BacktestExchangeService from './infrastructure/exchange-service/backtest-exchange.service';
import { AssetSymbol } from './models/asset-symbol';
import Ticker from './models/ticker';
import { bbWideningLongStrategy } from './strategies/bb-widening-long.strategy';
import Strategy from './strategies/strategy';
import { TimeFrame } from './timeframe/timeframe';
import Workspace from './workspace/workspace';

ConfigurationManager.load();

const start = Date.UTC(2023, 0, 1);
const end = Date.UTC(2023, 2, 3);
// const start = Date.UTC(2021, 0, 1);
// const end = Date.UTC(2023, 0, 1);
Workspace.init(true, true);

const ticker: Ticker = { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' };
const strategies: Strategy[] = [
  bbWideningLongStrategy(ticker, 1000, '1h', 20, 2.5, 0.009, 7, 0.4 / 100),
  // bbWideningLongStrategy(ticker, '4h', 20, 2.5, 0.02, 7, 0.4 / 100),
];
const tickTimeFrame: TimeFrame = '15m';
const fees = { maker: 0, taker: 0 };
// const fees = { maker: 0.1 / 100, taker: 0.1 / 100 };
const exchangeService = new BacktestExchangeService(ticker, tickTimeFrame, start, end, fees);

const backtest = new BackTest(tickTimeFrame, strategies, start, end, exchangeService);
await backtest.launch();

console.log('---> END');
