import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationManager } from '../config/configuration-manager';
import ExchangeService from '../infrastructure/exchange-service/exchange.service';
import AssetSymbol from '../models/asset-symbol';
import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';
import { getBacktestDataFile } from './backtest-data-file.helper';

ConfigurationManager.load();

console.log('Start get backtest data');

const tickers: Ticker[] = [
  { asset: AssetSymbol.bnb, base: AssetSymbol.usdt, exchangeId: 'binance' },
  { asset: AssetSymbol.xrp, base: AssetSymbol.usdt, exchangeId: 'binance' },
  { asset: AssetSymbol.ada, base: AssetSymbol.usdt, exchangeId: 'binance' },
  { asset: AssetSymbol.doge, base: AssetSymbol.usdt, exchangeId: 'binance' },
  { asset: AssetSymbol.matic, base: AssetSymbol.usdt, exchangeId: 'binance' },
  { asset: AssetSymbol.shib, base: AssetSymbol.usdt, exchangeId: 'binance' },
  { asset: AssetSymbol.dot, base: AssetSymbol.usdt, exchangeId: 'binance' },
  { asset: AssetSymbol.ltc, base: AssetSymbol.usdt, exchangeId: 'binance' },
  { asset: AssetSymbol.avax, base: AssetSymbol.usdt, exchangeId: 'binance' },
];
const timeframes: TimeFrame[] = ['5m', '15m', '30m', '1h', '2h', '4h', '1d'];
const years = [2020, 2021, 2022];

for (const ticker of tickers) {
  for (const year of years) {
    for (const timeframe of timeframes) {
      await getAndStoreOhlcvs(ticker, year, timeframe);
    }
  }
}

async function getAndStoreOhlcvs(ticker: Ticker, year: number, timeframe: TimeFrame) {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  
  // Get Data from exchange
  console.log('Retrieve OHLCVS from exchange');
  const exchange = new ExchangeService(ticker.exchangeId);
  const ohlcvs = await exchange.fetchRange(ticker, timeframe, start, end);
  console.log('Success !');
  const jsonArray = JSON.stringify(ohlcvs);
  
  // Store data in file
  const filePath = getBacktestDataFile(ticker, year, timeframe);
  const dirPath = path.dirname(filePath);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, jsonArray);
  }
  
  console.log('Json created :', filePath);
}
