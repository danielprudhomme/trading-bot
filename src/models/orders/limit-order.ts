import { OrderSide } from '../../enums/order-side';
import Ticker from '../ticker';
import Order from './order';

export default class LimitOrder extends Order {
  quantity: number;
  limit: number;

  constructor(ticker: Ticker, side: OrderSide, quantity: number, limit: number) {
    super(ticker, side, quantity, limit);
    this.quantity = quantity;
    this.limit = limit;
  }

  async transmitToExchange(): Promise<void> {
    this.exchangeOrder = await this.exchange.createLimitOrder(this.ticker, this.side, this.limit, this.quantity);
  }
}