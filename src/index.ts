import dotenv from 'dotenv';
import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import ExchangeService from './exchange.service';

dotenv.config();

// const start = new Date().getTime();

const exchange = new ExchangeService(ExchangeId.ftx);

// const data = await exchange.fetch('BTC/USDT', TimeFrame.t15s);
const symbol = 'BTC/USDT';
// const data = await exchange.fetchRange(symbol, TimeFrame.t15s, '2022-01-01T00:00:00Z', 1);

// récupérer en plus les 10 périodes précédents la date qu'on veut (pour calculer la MM10)
const startDate = '2022-01-01T00:00:00Z';
const timestampStart = exchange.parse8601(startDate);
const newTimestampStart = timestampStart - TimeFrame.toMilliseconds(TimeFrame.t1h) * 10;
const newStartDate = exchange.iso8601(newTimestampStart);
console.log(newStartDate);

const data = await exchange.fetchRange(symbol, TimeFrame.t1h, newStartDate, '2022-01-02T00:00:00Z');
console.log('Nombres de valeurs', data.length);

// find index of start date
const i = data.findIndex((x) => timestampStart - 1 <= x.timestamp);
console.log('found index', i);

const firstDate = data[0].getDate();
const lastDate = data[data.length - 1].getDate();
console.log('firstDate', firstDate);
console.log('lastDate', lastDate);

// console.info('Execution time: %dms', end);
