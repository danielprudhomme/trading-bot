import BackTestIndicator from './backtest-indicator';
import { ConfigurationManager } from './configuration-manager';
import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import BollingerBands from './indicators/bollinger-bands/bollinger-bands';
import OptiStrategy from './strategies/opti.strategy';

ConfigurationManager.load();

const strategy = new OptiStrategy('BTC/USDT');

// const backtest = new BackTest(
//   strategy,
//   TimeFrame.t5m,
//   '2022-07-01T04:00:00Z',
//   // '2022-09-02T01:00:00Z',
//   '2022-10-08T00:00:00Z',
//   // '2022-09-26T23:00:00Z',
//   ExchangeId.binance);

const backtest = new BackTestIndicator(TimeFrame.t1d,
  '2022-10-04T12:00:00Z',
  '2022-10-07T00:00:00Z',
  'BTC/USDT',
  ExchangeId.binance,
  new BollingerBands(20, 2.5));

await backtest.init();
await backtest.launch();
