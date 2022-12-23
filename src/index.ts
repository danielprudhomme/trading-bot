import BackTestIndicator from './backtest-indicator';
import { ConfigurationManager } from './config/configuration-manager';
import { macdZeroLag } from './indicators/macd-zero-lag/macd-zero-lag';
import AssetSymbol from './models/asset-symbol';
import Workspace from './workspace';

ConfigurationManager.load();

Workspace.init(true, true);

// const ticker: Ticker = {
//   asset: AssetSymbol.btc,
//   base: AssetSymbol.usdt,
//   exchangeId: 'binance',
// };

// const ohlcv = await Workspace.getExchange('binance').fetchOne(ticker, '15m');
// console.log('one', timestampToString(ohlcv.timestamp), ohlcv.close); 

// const ohlcvs = await Workspace.getExchange('binance').fetch(ticker, '15m', 200);
// console.log('all', ohlcvs.length);
// console.log('first', timestampToString(ohlcvs[0].timestamp), ohlcvs[0].close);
// console.log('last', timestampToString(ohlcvs[ohlcvs.length - 1].timestamp), ohlcvs[ohlcvs.length - 1].close);

const indicator = macdZeroLag(12, 26, 9);
const backtest = new BackTestIndicator('15m', indicator, { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' });
backtest.launch();