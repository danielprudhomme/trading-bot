import BackTest from './backtest';
import { ConfigurationManager } from './configuration-manager';
import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';

ConfigurationManager.load();

const backtest = new BackTest(
  TimeFrame.t15m,
  TimeFrame.t15m,
  '2022-09-03T15:00:00Z',
  // '2022-09-03T20:00:00Z',
  '2022-09-05T04:00:00Z',
  'BTC/USDT',
  ExchangeId.binance);
await backtest.init();
await backtest.launch();
