import { ConfigurationManager } from '../config/configuration-manager';
import { AssetSymbol } from '../models/asset-symbol';
import Ticker from '../models/ticker';
import Workspace from '../workspace/workspace';
import BackTestIndicator from './indicator.test';
import { sma } from './moving-average/sma';

console.log('--- Indicator test ---')

ConfigurationManager.load();
Workspace.init(false, true);

const ticker: Ticker = { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' };
const indicator = sma(20);
const backtest = new BackTestIndicator('1d', indicator, ticker);
await backtest.launch();

console.log('---> END');