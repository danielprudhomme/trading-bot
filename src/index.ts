import dotenv from 'dotenv';
import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import ExchangeService from './exchange.service';

dotenv.config();

// const start = new Date().getTime();

const exchange = new ExchangeService(ExchangeId.ftx);
const data = await exchange.fetch('BTC/USDT', TimeFrame.t1d);
console.log('Nombres de valeurs', data.length);
const firstDate = data[0].getDate();
const lastDate = data[data.length - 1].getDate();
console.log('firstDate', firstDate);
console.log('lastDate', lastDate);
// const date1 = lol[499].getDate();

// console.log(lol[0].getDate().getTime(), lol[0].timestamp);
// const end = new Date().getTime() - start;

// console.info('Execution time: %dms', end);
