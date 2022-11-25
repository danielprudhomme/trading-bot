import { Guid } from 'guid-typescript';
import { OrderSide } from '../../enums/order-side';
import Chart from '../../models/chart-old';
import ExchangeOrder from '../../models/exchange-order';
import Ticker from '../../models/ticker';
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

  private _chart: Chart | null = null;
  protected get chart(): Chart {
    if (!this._chart) throw new Error('Chart should not be null.');
    return this._chart;
  }

  addChart = (chart: Chart) => this._chart = chart;

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
      executedPrice: this.chart.currentCandlestick.close,
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

    if (order.type === 'limit' && order.limit &&
      ((order.side === 'sell' && this.chart.currentCandlestick.high >= order.limit) 
        || (order.side === 'buy' && this.chart.currentCandlestick.low <= order.limit))) {
        order.status = 'closed';
        order.executedPrice = order.limit;
    }
    
    return this.mapToExchangeOrder(order);
  }

  mapToExchangeOrder = (order: ReadOnlyExchangeOrder): ExchangeOrder => ({
    id: order.id,
    timestamp: order.timestamp,
    status: order.status,
    executedPrice: order.executedPrice,
  })
}
