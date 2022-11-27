import { Guid } from 'guid-typescript';
import { OrderSide } from '../../enums/order-side';
import Candlestick from '../../models/candlestick';
import ExchangeOrder from '../../models/exchange-order';
import Ticker from '../../models/ticker';
import Workspace from '../../workspace';
import ExchangeService from './exchange.service';

interface ReadOnlyExchangeOrder {
  id: string;
  ticker: Ticker;
  type: 'market' | 'limit';
  side: OrderSide;
  timestamp: number;
  status: 'open' | 'closed' | 'canceled';
  quantity: number;
  executedPrice?: number;
  limit?: number;
}

export default class ReadOnlyExchangeService extends ExchangeService {
  private orders = new Map<string, ReadOnlyExchangeOrder>();

  // TODO : ajouter des checks sur la quantité, s'il est possible de passer les ordres ou non (il faut avoir acheter avant de vendre)
  createMarketOrder = async (ticker: Ticker, side: OrderSide, quantity: number): Promise<ExchangeOrder> => {
    const order: ReadOnlyExchangeOrder = {
      id: Guid.create().toString(),
      ticker,
      type: 'market',
      side,
      timestamp: Date.now(),
      status: 'closed',
      quantity,
      executedPrice: this.currentCandlestick(ticker).close,
    };

    this.orders.set(order.id, order);
    return this.mapToExchangeOrder(order);
  }

  createLimitOrder = async (ticker: Ticker, side: OrderSide, limit: number, quantity: number): Promise<ExchangeOrder> => {
    const order: ReadOnlyExchangeOrder = {
      id: Guid.create().toString(),
      ticker,
      type: 'limit',
      side,
      timestamp: Date.now(),
      status: 'open',
      quantity,
      limit,
    };

    this.orders.set(order.id, order);
    return this.mapToExchangeOrder(order);
  }

  cancelOrder = async (ticker: Ticker, exchangeOrderId: string): Promise<ExchangeOrder | null> => {
    const order = this.orders.get(exchangeOrderId);
    if (!order) return null;
    order.status = 'canceled';
    return this.mapToExchangeOrder(order);
  }

  fetchOrder = async (ticker: Ticker, exchangeOrderId: string): Promise<ExchangeOrder | null> => {
    const order = this.orders.get(exchangeOrderId);
    if (!order) return null;
    if (order.status !== 'open') return order;

    const currentCandlestick = this.currentCandlestick(ticker);

    if (order.type === 'limit' && order.limit &&
      ((order.side === 'sell' && currentCandlestick.high >= order.limit) 
        || (order.side === 'buy' && currentCandlestick.low <= order.limit))) {
        order.status = 'closed';
        order.executedPrice = order.limit;
    }
    
    return this.mapToExchangeOrder(order);
  }

  private currentCandlestick = (ticker: Ticker): Candlestick => {
    const chart = Workspace.getChart(ticker);
    if (!chart) throw new Error('Chart should be defined');
    return chart.candlesticks[0];
  }

  private mapToExchangeOrder = (order: ReadOnlyExchangeOrder): ExchangeOrder => ({
    id: order.id,
    timestamp: order.timestamp,
    status: order.status,
    executedPrice: order.executedPrice,
  });
}
