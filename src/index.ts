import BackTestIndicator from './backtest-indicator';
import { ConfigurationManager } from './configuration-manager';
import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import BollingerBands from './indicators/bollinger-bands/bollinger-bands';

ConfigurationManager.load();

// const strategy = new MACDZeroLagStrategy(TimeFrame.t15m);

// const backtest = new BackTest(
//   strategy,
//   TimeFrame.t15m,
//   '2022-09-08T00:00:00Z',
//   '2022-09-08T20:00:00Z',
//   'BTC/USDT',
//   ExchangeId.binance);
const backtest = new BackTestIndicator(TimeFrame.t1d,
  '2022-09-01T12:00:00Z',
  '2022-09-17T00:00:00Z',
  'BTC/USDT',
  ExchangeId.binance,
  new BollingerBands(20, 2.5));
await backtest.init();
await backtest.launch();
