import BackTest from './backtest';
import { ConfigurationManager } from './configuration-manager';
import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import LowOutsideBBStrategy from './strategies/low-outside-bb.strategy';

ConfigurationManager.load();

const strategy = new LowOutsideBBStrategy('ETH/USDT', TimeFrame.t1h);

const backtest = new BackTest(
  strategy,
  TimeFrame.t5m,
  '2022-10-01T00:00:00Z',
  '2022-10-29T15:00:00Z',
  ExchangeId.binance);

// const backtest = new BackTestIndicator(TimeFrame.t1d,
//   '2022-10-04T12:00:00Z',
//   '2022-10-07T00:00:00Z',
//   'BTC/USDT',
//   ExchangeId.binance,
//   new BollingerBands(20, 2.5));

await backtest.init();
await backtest.launch();
