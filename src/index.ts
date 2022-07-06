import dotenv from 'dotenv';
import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import ExchangeService from './exchange.service';

dotenv.config();

// const start = new Date().getTime();

const exchange = new ExchangeService(ExchangeId.ftx);
// const data = await exchange.fetch('BTC/USDT', TimeFrame.t15s);
const data = await exchange.fetchRange('BTC/USDT', TimeFrame.t15s, '2022-01-01T00:00:00Z', 7);
console.log('Nombres de valeurs', data.length);

// data.forEach((x) => console.log(x.getDate()));
const firstDate = data[0].getDate();
const lastDate = data[data.length - 1].getDate();
console.log('firstDate', firstDate);
console.log('lastDate', lastDate);

// console.info('Execution time: %dms', end);
