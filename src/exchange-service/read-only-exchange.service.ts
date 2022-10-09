import { Guid } from 'guid-typescript';
import { ExchangeOrderStatus } from '../enums/exchange-order-status';
import { OrderSide } from '../enums/order-side';
import { OrderType } from '../enums/order-type';
import Chart from '../models/chart';
import ExchangeOrder from '../models/exchange-order';
import { Symbol } from '../models/symbol';
import ExchangeService from './exchange.service';

class ExtendedExchangeOrder extends ExchangeOrder {
  type: OrderType;
  side: OrderSide;
  limit: number | null;
  stop: number | null;
  quantity: number;

  constructor(id: string,
    timestamp: number,
    status: ExchangeOrderStatus,
    type: OrderType,
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
  createMarketOrder = async (symbol: Symbol, side: OrderSide, quantity: number): Promise<ExchangeOrder> => {
    const order = new ExtendedExchangeOrder(
      Guid.create().toString(),
      this.chart.currentCandlestick.timestamp,
      ExchangeOrderStatus.Closed,
      OrderType.Market,
      side,
      null,
      null,
      quantity,
      this.chart.currentCandlestick.close
    );
    this.orders.set(order.id, order);
    return order;
  }

  createlimitOrder = async (symbol: Symbol, side: OrderSide, limit: number, quantity: number): Promise<ExchangeOrder> => {
    const order = new ExtendedExchangeOrder(
      Guid.create().toString(),
      this.chart.currentCandlestick.timestamp,
      ExchangeOrderStatus.Open,
      OrderType.Limit,
      side,
      limit,
      null,
      quantity,
      this.chart.currentCandlestick.close
    );
    this.orders.set(order.id, order);
    return order;
  }

  cancelOrder = async (symbol: Symbol, exchangeOrderId: string): Promise<ExchangeOrder | null> => {
    const order = this.orders.get(exchangeOrderId);
    if (!order) return null;
    order.status = ExchangeOrderStatus.Canceled;
    return order;
  }

  fetchOrder = async (symbol: Symbol, exchangeOrderId: string): Promise<ExchangeOrder | null> => {
    const order = this.orders.get(exchangeOrderId);
    if (!order) return null;
    if (order.status !== ExchangeOrderStatus.Open) return order;

    if (order.type === OrderType.Limit && order.limit &&
      ((order.side === OrderSide.Sell && this.chart.currentCandlestick.high >= order.limit) 
        || (order.side === OrderSide.Buy && this.chart.currentCandlestick.low <= order.limit))) {
        order.status = ExchangeOrderStatus.Closed;
        order.executedPrice = order.limit;
        console.log('EXCHANGE --- limit order has been closed', order.executedPrice);
    }
    
    return order;
  }
}
