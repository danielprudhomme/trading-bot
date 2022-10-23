import { OrderSide } from '../../enums/order-side';
import ExchangeService from '../../exchange-service/exchange.service';
import { Symbol } from '../symbol';
import Order from './order';

export default class LimitOrder extends Order {
  quantity: number;
  limit: number;

  constructor(symbol: Symbol, side: OrderSide, quantity: number, limit: number) {
    super(symbol, side, quantity, limit);
    this.quantity = quantity;
    this.limit = limit;
  }

  async transmitToExchange(exchangeService: ExchangeService): Promise<void> {
    this.exchangeOrder = await exchangeService.createLimitOrder(this.symbol, this.side, this.limit, this.quantity);
  }
}