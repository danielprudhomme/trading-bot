import { ConfigurationManager } from '../config/configuration-manager';
import { AssetSymbol } from '../models/asset-symbol';
import Ticker from '../models/ticker';
import Workspace from '../workspace/workspace';
import BackTestIndicator from './indicator.test';
import { rsi } from './rsi/rsi';

console.log('--- Indicator test ---')

ConfigurationManager.load();
Workspace.init(false, true);

const ticker: Ticker = { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' };
const indicator = rsi(14);
const backtest = new BackTestIndicator('1d', indicator, ticker);
await backtest.launch();

console.log('---> END');