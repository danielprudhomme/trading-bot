import { Guid } from 'guid-typescript';
import { ExchangeOrderStatus } from '../../enums/exchange-order-status';
import { OrderSide } from '../../enums/order-side';
import Chart from '../../models/chart';
import ExchangeOrder from '../../models/exchange-order';
import Ticker from '../../models/ticker';
import ExchangeService from './exchange.service';

class ExtendedExchangeOrder extends ExchangeOrder {
  type: 'market' | 'limit';
  side: OrderSide;
  limit: number | null;
  stop: number | null;
  quantity: number;

  constructor(
    type: 'market' | 'limit',
    id: string,
    timestamp: number,
    status: ExchangeOrderStatus,
    side: OrderSide,
    limit: number | null,
    stop: number | null,
    quantity: number,
    executedPrice: number | null
  ) {
    super(id, timestamp, status, executedPrice);
    this.type = type;
    this.side = side;
    this.limit = limit;
    this.stop = stop;
    this.quantity = quantity;
  }
}

export default class ReadOnlyExchangeService extends ExchangeService {
  private orders = new Map<string, ExtendedExchangeOrder>();

  private _chart: Chart | null = null;
  protected get chart(): Chart {
    if (!this._chart) throw new Error('Chart should not be null.');
    return this._chart;
  }

  addChart = (chart: Chart) => this._chart = chart;

  // TODO : ajouter des checks sur la quantité, s'il est possible de passer les ordres ou non (il faut avoir acheter avant de vendre)
  createMarketOrder = async (ticker: Ticker, side: OrderSide, quantity: number): Promise<ExchangeOrder> => {
    const order = new ExtendedExchangeOrder(
      'market',
      Guid.create().toString(),
      this.chart.currentCandlestick.timestamp,
      ExchangeOrderStatus.Closed,
      side,
      null,
      null,
      quantity,
      this.chart.currentCandlestick.close
    );
    this.orders.set(order.id, order);
    return order;
  }

  createLimitOrder = async (ticker: Ticker, side: OrderSide, limit: number, quantity: number): Promise<ExchangeOrder> => {
    const order = new ExtendedExchangeOrder(
      'limit',
      Guid.create().toString(),
      this.chart.currentCandlestick.timestamp,
      ExchangeOrderStatus.Open,
      side,
      limit,
      null,
      quantity,
      this.chart.currentCandlestick.close
    );
    this.orders.set(order.id, order);
    return order;
  }

  cancelOrder = async (ticker: Ticker, exchangeOrderId: string): Promise<ExchangeOrder | null> => {
    const order = this.orders.get(exchangeOrderId);
    if (!order) return null;
    order.status = ExchangeOrderStatus.Canceled;
    return order;
  }

  fetchOrder = async (ticker: Ticker, exchangeOrderId: string): Promise<ExchangeOrder | null> => {
    const order = this.orders.get(exchangeOrderId);
    if (!order) return null;
    if (order.status !== ExchangeOrderStatus.Open) return order;

    if (order.type === 'limit' && order.limit &&
      ((order.side === OrderSide.Sell && this.chart.currentCandlestick.high >= order.limit) 
        || (order.side === OrderSide.Buy && this.chart.currentCandlestick.low <= order.limit))) {
        order.status = ExchangeOrderStatus.Closed;
        order.executedPrice = order.limit;
    }
    
    return order;
  }
}
