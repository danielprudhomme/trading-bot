// import BackTest from './backtest';
import { ConfigurationManager } from './configuration-manager';
import ExchangeId from './enums/exchange-id';
import ExchangeService from './exchange.service';

ConfigurationManager.load();

// const start = new Date().getTime();

const exchange = new ExchangeService(ExchangeId.binance); 

exchange.fetchOrders();


// const data = await exchange.fetch('BTC/USDT', TimeFrame.t1d);
 
// const indic = new RSI();
// const chart = new Chart(TimeFrame.t1d, data);
// chart.addIndicator(indic);

// console.log(chart.candles[chart.candles.length - 2].getIndicatorValue(indic));

// chart.candles.forEach(x => {
//   const macdzl = x.getIndicatorValue(indic) as MacdZeroLagValue;
//   console.log('values :::', x.close, macdzl.macdZeroLag, macdzl.signal, macdzl.macdAboveSignal);
// });

// const ema = ExponentialSMA.calculate(data.map(x => x.close), 9);
// console.log(ema);

// const ma2 = new SMA(10);

// Candle.setIndicatorValue(ma1, 100);
// Candle.setIndicatorValue(ma2, 200);

// console.log(Candle.getIndicatorValue(ma1), Candle.getIndicatorValue(ma2));


// const backtest = new BackTest(exchange);

// await backtest.launch();

// const symbol = 'BTC/USDT';
// const data = await exchange.fetch('BTC/USDT', TimeFrame.t1h);

// const data = await exchange.fetchRange(symbol, TimeFrame.t15s, '2022-01-01T00:00:00Z', 1);

// récupérer en plus les 10 périodes précédents la date qu'on veut (pour calculer la MM10)
// const startDate = '2022-01-01T00:00:00Z';
// const timestampStart = exchange.parse8601(startDate);
// const newTimestampStart = timestampStart - TimeFrame.toMilliseconds(TimeFrame.t1h) * 10;
// const endTimestamp = exchange.parse8601('2022-01-02T00:00:00Z');

// const data = await exchange.fetchRange(symbol, TimeFrame.t1h, newTimestampStart, endTimestamp);
// console.log('Nombres de valeurs', data.length);

// // find index of start date
// const i = data.findIndex(x => timestampStart - 1 <= x.timestamp);
// console.log('found index', i);

// const firstDate = data[0].getDate();
// const lastOhlcv = data[data.length - 1];
// const lastDate = lastOhlcv.getDate();
// console.log('firstDate', firstDate);
// console.log('open', lastOhlcv.open);
// console.log('close', lastOhlcv.close);  
// console.log('high', lastOhlcv.high);
// console.log('low', lastOhlcv.low);
// console.log('lastDate', lastDate);   
// console.info('Execution time: %dms', end);

// console.log('MA10', SMA.calculate(10, data));
