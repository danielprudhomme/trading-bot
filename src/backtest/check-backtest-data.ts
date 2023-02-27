import * as fs from 'fs';
import { timestampToString } from '../helpers/date';
import { AssetSymbol } from '../models/asset-symbol';
import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';
import { getBacktestDataFile } from './backtest-data-file.helper';

const ticker: Ticker = { asset: AssetSymbol.btc, base: AssetSymbol.usdt, exchangeId: 'binance' };
const timeframe: TimeFrame = '5m';
const year = 2022;

const filePath = getBacktestDataFile(ticker, year, timeframe);
const jsonString = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(jsonString);

console.log('ohlcvs number : ', data.length);
console.log('first : ', timestampToString(data[0].timestamp), data[0].close);
console.log('last : ', timestampToString(data[data.length - 1].timestamp), data[data.length - 1].close);
