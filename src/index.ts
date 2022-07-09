import dotenv from 'dotenv';
import BackTest from './backtest';
import ExchangeId from './enums/exchange-id';
import ExchangeService from './exchange.service';

dotenv.config();

// const start = new Date().getTime();

const exchange = new ExchangeService(ExchangeId.ftx);

const backtest = new BackTest(exchange);

await backtest.launch();

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

// console.log('MA10', MovingAverage.calculate(10, data));
