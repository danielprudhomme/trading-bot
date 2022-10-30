import BackTest from './backtest';
import { ConfigurationManager } from './configuration-manager';
import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import AssetSymbol from './models/asset-symbol';
import Ticker from './models/ticker';
import LowOutsideBBStrategy from './strategies/low-outside-bb.strategy';

ConfigurationManager.load();

const ticker = new Ticker(AssetSymbol.btc, AssetSymbol.usdt, ExchangeId.binance);
const strategy = new LowOutsideBBStrategy(ticker, TimeFrame.t1h);

const backtest = new BackTest(
  strategy,
  TimeFrame.t15m,
  '2022-10-27T22:00:00Z',
  '2022-10-28T10:00:00Z',
);

// const backtest = new BackTestIndicator(TimeFrame.t1d,
//   '2022-10-04T12:00:00Z',
//   '2022-10-07T00:00:00Z',
//   ticker,
//   new BollingerBands(20, 2.5));

await backtest.init();
await backtest.launch();
