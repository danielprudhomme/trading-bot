/* eslint-disable no-await-in-loop */
import ccxt from 'ccxt';
import { config, Config } from './config';
import TimeFrame from './enums/timeframe';
import Ohlcv from './models/ohlcv';

export default class ExchangeService {
  private client: ccxt.Exchange;

  constructor(exchange: string) {
    const CCXT = ccxt as any;
    this.client = new CCXT[exchange]({
      apiKey: config[exchange as keyof Config].apiKey,
      secret: config[exchange as keyof Config].apiKey,
      enableRateLimit: true,
    });
  }

  parse8601 = (date: string) => this.client.parse8601(date);

  iso8601 = (timestamp: number) => this.client.iso8601(timestamp);

  async fetch(
    symbol: string,
    timeframe: TimeFrame,
    since: number | undefined = undefined,
  ): Promise<Ohlcv[]> {
    const ohlcvs = await this.client.fetchOHLCV(symbol, timeframe as string, since);
    return ohlcvs.map((x: any) => new Ohlcv(x));
  }

  async fetchRange(
    symbol: string,
    timeframe: TimeFrame,
    start: number,
    end: number,
  ): Promise<Ohlcv[]> {
    let since = start;
    let ohlcvs: Ohlcv[] = [];

    while (since < end) {
      const response = await this.fetch(symbol, timeframe, since);
      ohlcvs = ohlcvs.concat(response.filter(x => x.timestamp < end));

      if (response.length > 0) {
        since = response[response.length - 1].timestamp + 1;
      }
    }

    return ohlcvs;
  }
}
