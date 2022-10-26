import { OrderSide } from '../../enums/order-side';
import { OrderStatus } from '../../enums/order-status';
import ExchangeService from '../../exchange-service/exchange.service';
import { Symbol } from '../symbol';
import Order from './order';

export default class StopOrder extends Order {
  constructor(symbol: Symbol, side: OrderSide, limit: number) {
    super(symbol, side, 'remaining', limit);
  }

  async transmitToExchange(exchangeService: ExchangeService, options: { remainingQuantity: number }): Promise<void> {
    this.quantity = options.remainingQuantity;
    this.exchangeOrder = await exchangeService.createMarketOrder(this.symbol, this.side, this.quantity);
    this.status = OrderStatus.Closed;
  }
}