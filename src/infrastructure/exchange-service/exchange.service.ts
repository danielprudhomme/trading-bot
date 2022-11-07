/* eslint-disable no-await-in-loop */
import ccxt from 'ccxt';
import { ConfigurationManager } from '../../config/configuration-manager';
import ExchangeId from '../../enums/exchange-id';
import { OrderSide } from '../../enums/order-side';
import TimeFrame from '../../enums/timeframe';
import ExchangeOrder from '../../models/exchange-order';
import { mapFromCcxt, OHLCV } from '../../models/ohlcv';
import Ticker from '../../models/ticker';

export default class ExchangeService {
  protected client: ccxt.Exchange;

  constructor(exchange: ExchangeId) {
    const CCXT = ccxt as any;
    const config = ConfigurationManager.getExchangeConfig(exchange);

    this.client = new CCXT[exchange.toString()]({ 
      apiKey: config.apiKey,
      secret: config.secretKey,
      enableRateLimit: true,
    });
  }

  parse8601 = (date: string) => this.client.parse8601(date);

  iso8601 = (timestamp: number) => this.client.iso8601(timestamp);

  fetchOHLCV = async (ticker: Ticker, timeframe: TimeFrame, since: number | undefined = undefined): Promise<OHLCV[]> =>
    (await this.client.fetchOHLCV(this.tickerToString(ticker), timeframe as string, since)).map(ohlcv => mapFromCcxt(timeframe, ohlcv));

  async fetchOHLCVRange(
    ticker: Ticker,
    timeframe: TimeFrame,
    start: number,
    end: number,
  ): Promise<OHLCV[]> {
    let since = start;
    let ohlcvs: OHLCV[] = [];

    while (since < end) {
      const response = await this.fetchOHLCV(ticker, timeframe, since);
      ohlcvs = ohlcvs.concat(response.filter(x => x.timestamp < end));

      if (response.length > 0) {
        since = response[response.length - 1].timestamp + 1;
      }
    }

    return ohlcvs;
  }

  createMarketOrder = async (ticker: Ticker, side: OrderSide, quantity: number): Promise<ExchangeOrder> =>
    ExchangeOrder.mapCcxtOrder(
      await this.client.createMarketOrder(this.tickerToString(ticker), this.toExchangeOrderSide(side), quantity));

  createLimitOrder = async (ticker: Ticker, side: OrderSide, limit: number, quantity: number): Promise<ExchangeOrder> =>
    ExchangeOrder.mapCcxtOrder(
      await this.client.createLimitOrder(this.tickerToString(ticker), this.toExchangeOrderSide(side), quantity, limit));

  cancelOrder = async (ticker: Ticker, exchangeOrderId: string): Promise<ExchangeOrder | null> =>
    ExchangeOrder.mapCcxtOrder(
      await this.client.cancelOrder(exchangeOrderId, this.tickerToString(ticker)));

  fetchOrder = async (ticker: Ticker, exchangeOrderId: string): Promise<ExchangeOrder | null> =>
    ExchangeOrder.mapCcxtOrder(
      await this.client.fetchOrder(exchangeOrderId, this.tickerToString(ticker)));

  async fetchOrders(): Promise<void>  {//Promise<ccxt.Order[]>  {
    const orders = await this.client.fetchOrders('EGLD/BUSD', undefined, 2);

    // this.client.cancelOrder()

    // const order = await this.client.fetchOrder('362922220', 'EGLD/BUSD');

    // const orders = await this.client.fetchOpenOrders('EGLD/BUSD');
    // const order = await this.client.createLimitBuyOrder('BTCBUSD', 0.001, 22000);
    // const order = await this.client.createMarketOrder('EGLD/BUSD', 'buy', 0.001);

    // const order1 = await this.client.fetchOrder(order.id, order.ticker);

    // await this.client.cancelOrder('5526182628', 'BTC/BUSD');
    // return orders;
  }

  private toExchangeOrderSide = (side: OrderSide): 'buy' | 'sell' => side === OrderSide.Buy ? 'buy' : 'sell';

  private tickerToString = (ticker: Ticker): string => `${ticker.asset}/${ticker.base}`;
}
