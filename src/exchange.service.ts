import ccxt from 'ccxt';
import { config, Config } from './config';
import TimeFrame from './enums/timeframe';
import Ohlcv from './models/ohlcv';

export default class ExchangeService {
  client: ccxt.Exchange;

  constructor(exchange: string) {
    const CCXT = ccxt as any;
    this.client = new CCXT[exchange]({
      apiKey: config[exchange as keyof Config].apiKey,
      secret: config[exchange as keyof Config].apiKey,
      enableRateLimit: true,
    });
  }

  async fetch(ticker: string, timeframe: TimeFrame): Promise<Ohlcv[]> {
    // const since = this.client.parse8601('2018-01-01');
    // const since = new Date('2022-01-20T09:15:00.000Z').getTime();
    // const since = 1656062100000 - 4 * 24 * 60 * 60 * 1000;
    // const since = new Date(2019, 1, 1).getTime();
    const ohlcv = await this.client.fetchOHLCV(ticker, timeframe as string);
    // , timeframe);// , since, 1001); // , since);
    return ohlcv.map((x: any) => new Ohlcv(x[0], x[1], x[2], x[3], x[4], x[5]));
  }
}
