import BackTest from './backtest';
import { ConfigurationManager } from './configuration-manager';
import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';

ConfigurationManager.load();

const backtest = new BackTest(
  TimeFrame.t1h,
  TimeFrame.t15m,
  '2022-08-21T00:00:00Z',
  '2022-08-22T02:00:00Z',
  'BTC/USDT',
  ExchangeId.binance);
await backtest.init();
await backtest.launch();
