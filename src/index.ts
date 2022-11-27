import { ConfigurationManager } from './config/configuration-manager';
import AssetSymbol from './models/asset-symbol';
import Ticker from './models/ticker';
import Workspace from './workspace';

ConfigurationManager.load();

Workspace.init(true, true);

const ticker: Ticker = {
  asset: AssetSymbol.btc,
  base: AssetSymbol.usdt,
  exchangeId: 'binance',
};

Workspace.getExchange('binance')

// const strategy = new LowOutsideBBStrategy(ticker, TimeFrame.t1h);

// const backtest = new BackTest(
//   strategy,
//   TimeFrame.t15m,
//   '2022-10-27T22:00:00Z',
//   '2022-11-09T10:00:00Z',
// );

// // const backtest = new BackTestIndicator(TimeFrame.t1d,
// //   '2022-10-04T12:00:00Z',
// //   '2022-10-07T00:00:00Z',
// //   ticker,
// //   new BollingerBands(20, 2.5));

// await backtest.init();
// await backtest.launch();
