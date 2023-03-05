import { ConfigurationManager } from '../config/configuration-manager';
import { AssetSymbol } from '../models/asset-symbol';
import Ticker from '../models/ticker';
import Workspace from '../workspace/workspace';
import { bb } from './bollinger-bands/bollinger-bands';
import BackTestIndicator from './indicator.test';

console.log('--- Indicator test ---')

ConfigurationManager.load();
Workspace.init(false, true);

const ticker: Ticker = { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' };
const indicator = bb(20, 2.5);
const backtest = new BackTestIndicator('1d', indicator, ticker);
await backtest.launch();

console.log('---> END');