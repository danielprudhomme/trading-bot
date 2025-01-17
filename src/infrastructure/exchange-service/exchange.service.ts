/* eslint-disable no-await-in-loop */
import ccxt from 'ccxt';
import { ConfigurationManager } from '../../config/configuration-manager';
import { CHART_CANDLESTICKS_COUNT } from '../../config/constants';
import { ExchangeId } from '../../enums/exchange-id';
import { OrderSide } from '../../enums/order-side';
import { AssetSymbol } from '../../models/asset-symbol';
import ExchangeOrder from '../../models/exchange-order';
import { OHLCV } from '../../models/ohlcv';
import Ticker from '../../models/ticker';
import { TimeFrame } from '../../timeframe/timeframe';

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

  /* Returns OHLCV array : first is oldest, last is most recent */
  fetchChartInit = async (ticker: Ticker, timeframe: TimeFrame): Promise<OHLCV[]> => 
    await this.fetchOHLCV(ticker, timeframe, undefined, CHART_CANDLESTICKS_COUNT);

  fetchOne = async (ticker: Ticker, timeframe: TimeFrame): Promise<OHLCV> => 
    (await this.fetchOHLCV(ticker, timeframe, undefined, 1))[0];

  createMarketOrder = async (ticker: Ticker, side: OrderSide, quantity: number): Promise<ExchangeOrder> =>
    this.mapCcxtOrder(
      await this.client.createMarketOrder(this.toString(ticker), side, quantity));

  createLimitOrder = async (ticker: Ticker, side: OrderSide, limit: number, quantity: number): Promise<ExchangeOrder> =>
    this.mapCcxtOrder(
      await this.client.createLimitOrder(this.toString(ticker), side, quantity, limit));

  cancelOrder = async (ticker: Ticker, exchangeOrderId: string): Promise<ExchangeOrder | null> =>
    this.mapCcxtOrder(
      await this.client.cancelOrder(exchangeOrderId, this.toString(ticker)));

  fetchOrder = async (ticker: Ticker, exchangeOrderId: string): Promise<ExchangeOrder | null> =>
    this.mapCcxtOrder(
      await this.client.fetchOrder(exchangeOrderId, this.toString(ticker)));

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

  async fetchFreeBalance(): Promise<{ asset: AssetSymbol, amount: number }[]> {
    const balances = await this.client.fetchBalance(); // returns huge object with all balances
  
    return Object.values(AssetSymbol).map(asset => {
      const amount = balances[asset]?.free ?? 0;
      return { asset, amount };
    });
  }

  protected fetchOHLCV = async (
    ticker: Ticker,
    timeframe: TimeFrame,
    since: number | undefined = undefined,
    limit: number | undefined = undefined): Promise<OHLCV[]> =>
    (await this.client.fetchOHLCV(this.toString(ticker), timeframe, since, limit)).map(ohlcv => this.mapCcxtOhlcv(timeframe, ohlcv));

  async fetchRange(
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
      else {
        break;
      }
    }

    return ohlcvs;
  }

  private toString = (ticker: Ticker): string => `${ticker.asset}/${ticker.base}`;

  private mapCcxtOhlcv = (timeframe: TimeFrame, ohlcv: ccxt.OHLCV): OHLCV => ({
    timeframe,
    timestamp: ohlcv[0],
    open: ohlcv[1],
    high: ohlcv[2],
    low: ohlcv[3],
    close: ohlcv[4],
    volume: ohlcv[5],
  });

  private mapCcxtOrder = (order: ccxt.Order): ExchangeOrder => ({
    id: order.id,
    timestamp: order.timestamp,
    status: order.status,
    executedPrice: order.average,
    fee: {
      asset: order.fee.currency as AssetSymbol,
      amount: order.fee.cost
    }
  });
}
