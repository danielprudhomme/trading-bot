import BackTest from './backtest';
import { ConfigurationManager } from './config/configuration-manager';
import AssetSymbol from './models/asset-symbol';
import Ticker from './models/ticker';
import { lowOutsideBBStrategy } from './strategies/low-outside-bb.strategy';
import Strategy from './strategies/strategy';
import Workspace from './workspace';

ConfigurationManager.load();

const start = Date.UTC(2022, 11, 10, 10);
const end = Date.UTC(2022, 11, 15, 11);
Workspace.init(true, true);

const ticker: Ticker = { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' };
const strategy: Strategy = lowOutsideBBStrategy(ticker, '1h');
const backtest = new BackTest('15m', strategy, start, end);
await backtest.launch();

console.log('---> END');

// const indicator = macdZeroLag(12, 26, 9);
// const backtest = new BackTestIndicator('15m', indicator, { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' });
// backtest.launch();