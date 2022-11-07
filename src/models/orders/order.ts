import { Guid } from 'guid-typescript';
import { ExchangeOrderStatus } from '../../enums/exchange-order-status';
import { OrderSide } from '../../enums/order-side';
import { OrderStatus } from '../../enums/order-status';
import ExchangeService from '../../infrastructure/exchange-service/exchange.service';
import Workspace from '../../workspace';
import ExchangeOrder from '../exchange-order';
import Ticker from '../ticker';

export default abstract class Order {
  id: Guid = Guid.create();
  ticker: Ticker;
  exchangeOrder: ExchangeOrder | null = null;
  side: OrderSide;
  status: OrderStatus = OrderStatus.Waiting;
  limit: number | null;
  quantity: number | 'remaining';

  protected constructor(
    ticker: Ticker,
    side: OrderSide,
    quantity: number | 'remaining',
    limit: number | null = null,
  ) {
    this.ticker = ticker;
    this.side = side;
    this.quantity = quantity;
    this.limit = limit;
  }

  protected get exchange(): ExchangeService {
    return Workspace.getExchange(this.ticker.exchangeId);
  }

  abstract transmitToExchange(options: { remainingQuantity: number }): Promise<void>;

  async cancel(): Promise<void> {
    this.status = OrderStatus.Canceled;
    if (!this.exchangeOrder || this.exchangeOrder.status !== ExchangeOrderStatus.Open) return;
    await this.exchange.cancelOrder(this.ticker, this.exchangeOrder.id);
  }

  /* Synchronize order with exchange (checks if closed in exchange) */
  async synchronizeWithExchange(): Promise<void> {
    if (!this.exchangeOrder) return;

    const exchangeOrder = await this.exchange.fetchOrder(this.ticker, this.exchangeOrder.id);
    if (!exchangeOrder) return;
    this.exchangeOrder = exchangeOrder;

    if (this.exchangeOrder.status !== ExchangeOrderStatus.Closed) return;
    this.status = OrderStatus.Closed;
  }
}