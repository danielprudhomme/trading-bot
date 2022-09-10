import BackTestIndicator from './backtest-indicator';
import { ConfigurationManager } from './configuration-manager';
import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import BollingerBands from './indicators/bollinger-bands';

ConfigurationManager.load();

// const backtest = new BackTest(
//   TimeFrame.t15m,
//   TimeFrame.t15m,
//   '2022-09-08T00:00:00Z',
//   '2022-09-08T20:00:00Z',
//   'BTC/USDT',
//   ExchangeId.binance);
const backtest = new BackTestIndicator(
  TimeFrame.t1d, '2022-09-08T00:00:00Z', '2022-09-10T00:00:00Z',
  'BTC/USDT',
  ExchangeId.binance,
  new BollingerBands(20, 2));
await backtest.init();
await backtest.launch();
