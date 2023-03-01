import BackTest from './backtest';
import { ConfigurationManager } from './config/configuration-manager';
import BacktestExchangeService from './infrastructure/exchange-service/backtest-exchange.service';
import { AssetSymbol } from './models/asset-symbol';
import Ticker from './models/ticker';
import { bbWideningLongStrategy } from './strategies/bb-widening-long.strategy';
import Strategy from './strategies/strategy';
import { TimeFrame } from './timeframe/timeframe';
import Workspace from './workspace';

ConfigurationManager.load();

const start = Date.UTC(2021, 11, 15);
const end = Date.UTC(2021, 11, 20);
// const start = Date.UTC(2021, 0, 1);
// const end = Date.UTC(2023, 0, 1);
Workspace.init(true, true);

const ticker: Ticker = { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' };
const strategies: Strategy[] = [
  bbWideningLongStrategy(ticker, '1h', 20, 2.5, 0.009, 7, 0.4 / 100),
  // bbWideningLongStrategy(ticker, '4h', 20, 2.5, 0.02, 7, 0.4 / 100),
];
const tickTimeFrame: TimeFrame = '15m';
const fees = { maker: 0.01, taker: 0.01 };
const exchangeService = new BacktestExchangeService(ticker, tickTimeFrame, start, end, fees, 1000);

const backtest = new BackTest(tickTimeFrame, strategies, start, end, exchangeService);
await backtest.launch();

console.log('---> END');

// const indicator = macdZeroLag(12, 26, 9);
// const backtest = new BackTestIndicator('15m', indicator, { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' });
// backtest.launch();