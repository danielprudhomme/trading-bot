import { OrderSide } from '../../enums/order-side';
import { OrderStatus } from '../../enums/order-status';
import Ticker from '../ticker';
import Order from './order';

export default class MarketOrder extends Order {
  quantity: number;

  constructor(ticker: Ticker, side: OrderSide, quantity: number) {
    super(ticker, side, quantity);
    this.quantity = quantity;
  }

  async transmitToExchange(): Promise<void> {
    this.exchangeOrder = await this.exchange.createMarketOrder(this.ticker, this.side, this.quantity);
    this.status = OrderStatus.Closed;
  }
}