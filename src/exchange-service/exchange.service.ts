/* eslint-disable no-await-in-loop */
import ccxt from 'ccxt';
import { Config, ConfigurationManager } from '../configuration-manager';
import ExchangeId from '../enums/exchange-id';
import { OrderSide } from '../enums/order-side';
import TimeFrame from '../enums/timeframe';
import ExchangeOrder from '../models/exchange-order';

export default class ExchangeService {
  protected client: ccxt.Exchange;

  constructor(exchange: ExchangeId) {
    const CCXT = ccxt as any;
    const config = ConfigurationManager.config[exchange as keyof Config];

    this.client = new CCXT[exchange.toString()]({ 
      apiKey: config.apiKey,
      secret: config.secretKey,
      enableRateLimit: true,
    });
  }

  parse8601 = (date: string) => this.client.parse8601(date);

  iso8601 = (timestamp: number) => this.client.iso8601(timestamp);

  async fetchOHLCV(
    symbol: string,
    timeframe: TimeFrame,
    since: number | undefined = undefined,
  ): Promise<ccxt.OHLCV[]> {
    return await this.client.fetchOHLCV(symbol, timeframe as string, since);
  }

  async fetchOHLCVRange(
    symbol: string,
    timeframe: TimeFrame,
    start: number,
    end: number,
  ): Promise<ccxt.OHLCV[]> {
    let since = start;
    let ohlcvs: ccxt.OHLCV[] = [];

    while (since < end) {
      const response = await this.fetchOHLCV(symbol, timeframe, since);
      ohlcvs = ohlcvs.concat(response.filter(x => x[0] < end));

      if (response.length > 0) {
        since = response[response.length - 1][0] + 1;
      }
    }

    return ohlcvs;
  }

  createMarketOrder = async (symbol: string, side: OrderSide, quantity: number): Promise<ExchangeOrder> =>
    ExchangeOrder.mapCcxtOrder(
      await this.client.createMarketOrder(symbol, this.toExchangeOrderSide(side), quantity));

  createlimitOrder = async (symbol: string, side: OrderSide, limit: number, quantity: number): Promise<ExchangeOrder> =>
    ExchangeOrder.mapCcxtOrder(
      await this.client.createLimitOrder(symbol, this.toExchangeOrderSide(side), quantity, limit));

  cancelOrder = async (symbol: string, exchangeOrderId: string): Promise<ExchangeOrder | null> =>
    ExchangeOrder.mapCcxtOrder(
      await this.client.cancelOrder(exchangeOrderId, symbol));

  fetchOrder = async (symbol: string, exchangeOrderId: string): Promise<ExchangeOrder | null> =>
    ExchangeOrder.mapCcxtOrder(
      await this.client.fetchOrder(exchangeOrderId, symbol));

  async fetchOrders(): Promise<void>  {//Promise<ccxt.Order[]>  {
    const orders = await this.client.fetchOrders('EGLD/BUSD', undefined, 2);

    // this.client.cancelOrder()

    // const order = await this.client.fetchOrder('362922220', 'EGLD/BUSD');

    // const orders = await this.client.fetchOpenOrders('EGLD/BUSD');
    // const order = await this.client.createLimitBuyOrder('BTCBUSD', 0.001, 22000);
    // const order = await this.client.createMarketOrder('EGLD/BUSD', 'buy', 0.001);

    // const order1 = await this.client.fetchOrder(order.id, order.symbol);

    // await this.client.cancelOrder('5526182628', 'BTC/BUSD');
    // return orders;
  }

  private toExchangeOrderSide = (side: OrderSide): 'buy' | 'sell' => side === OrderSide.Buy ? 'buy' : 'sell';
}
