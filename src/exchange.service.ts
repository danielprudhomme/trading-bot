/* eslint-disable no-await-in-loop */
import ccxt from 'ccxt';
import { Config, ConfigurationManager } from './configuration-manager';
import TimeFrame from './enums/timeframe';

export default class ExchangeService {
  private client: ccxt.Exchange;

  constructor(exchange: string) {
    const CCXT = ccxt as any;
    const config = ConfigurationManager.config[exchange as keyof Config];

    this.client = new CCXT[exchange]({ 
      apiKey: config.apiKey,
      secret: config.secretKey,
      enableRateLimit: true,
    });
  }

  parse8601 = (date: string) => this.client.parse8601(date);

  iso8601 = (timestamp: number) => this.client.iso8601(timestamp);

  async fetch(
    symbol: string,
    timeframe: TimeFrame,
    since: number | undefined = undefined,
  ): Promise<ccxt.OHLCV[]> {
    return await this.client.fetchOHLCV(symbol, timeframe as string, since);
  }

  async fetchRange(
    symbol: string,
    timeframe: TimeFrame,
    start: number,
    end: number,
  ): Promise<ccxt.OHLCV[]> {
    let since = start;
    let ohlcvs: ccxt.OHLCV[] = [];

    while (since < end) {
      const response = await this.fetch(symbol, timeframe, since);
      ohlcvs = ohlcvs.concat(response.filter(x => x[0] < end));

      if (response.length > 0) {
        since = response[response.length - 1][0] + 1;
      }
    }

    return ohlcvs;
  }

  async fetchOrders(): Promise<ccxt.Order[]>  {
    const orders = await this.client.fetchOrders('EGLD/BUSD');
    console.log(orders);
    return orders;
  }
}
