import BackTest from './backtest';
import { ConfigurationManager } from './config/configuration-manager';
import AssetSymbol from './models/asset-symbol';
import Ticker from './models/ticker';
import { lowOutsideBBStrategy } from './strategies/low-outside-bb.strategy';
import Strategy from './strategies/strategy';
import Workspace from './workspace';

ConfigurationManager.load();

const start = Date.UTC(2022, 11, 16);
const end = Date.UTC(2023, 0, 27);
Workspace.init(true, true);

const ticker: Ticker = { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' };
const strategy1: Strategy = lowOutsideBBStrategy(ticker, '1h');
const strategy2: Strategy = lowOutsideBBStrategy(ticker, '30m');
const backtest = new BackTest('5m', [strategy1, strategy2], start, end);
await backtest.launch();

console.log('---> END');

// const indicator = macdZeroLag(12, 26, 9);
// const backtest = new BackTestIndicator('15m', indicator, { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' });
// backtest.launch();