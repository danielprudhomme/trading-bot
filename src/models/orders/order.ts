import { Guid } from 'guid-typescript';
import { ExchangeOrderStatus } from '../../enums/exchange-order-status';
import { OrderSide } from '../../enums/order-side';
import { OrderStatus } from '../../enums/order-status';
import ExchangeService from '../../exchange-service/exchange.service';
import ExchangeOrder from '../exchange-order';
import { Symbol } from '../symbol';

export default abstract class Order {
  id: Guid = Guid.create();
  symbol: Symbol;
  exchangeOrder: ExchangeOrder | null = null;
  side: OrderSide;
  status: OrderStatus = OrderStatus.Waiting;
  limit: number | null;
  quantity: number | 'remaining';

  protected constructor(
    symbol: Symbol,
    side: OrderSide,
    quantity: number | 'remaining',
    limit: number | null = null,
  ) {
    this.symbol = symbol;
    this.side = side;
    this.quantity = quantity;
    this.limit = limit;
  }

  abstract transmitToExchange(exchangeService: ExchangeService, options: { remainingQuantity: number }): Promise<void>;

  async cancel(exchangeService: ExchangeService): Promise<void> {
    this.status = OrderStatus.Canceled;
    if (!this.exchangeOrder || this.exchangeOrder.status !== ExchangeOrderStatus.Open) return;
    await exchangeService.cancelOrder(this.symbol, this.exchangeOrder.id);
  }

  /* Synchronize order with exchange (checks if closed in exchange) */
  async synchronizeWithExchange(exchangeService: ExchangeService): Promise<void> {
    if (!this.exchangeOrder) return;

    const exchangeOrder = await exchangeService.fetchOrder(this.symbol, this.exchangeOrder.id);
    if (!exchangeOrder) return;
    this.exchangeOrder = exchangeOrder;

    if (this.exchangeOrder.status !== ExchangeOrderStatus.Closed) return;
    this.status = OrderStatus.Closed;
  }
}