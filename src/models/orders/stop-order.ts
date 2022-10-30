import { OrderSide } from '../../enums/order-side';
import { OrderStatus } from '../../enums/order-status';
import ExchangeService from '../../exchange-service/exchange.service';
import Ticker from '../ticker';
import Order from './order';

export default class StopOrder extends Order {
  constructor(ticker: Ticker, side: OrderSide, limit: number) {
    super(ticker, side, 'remaining', limit);
  }

  async transmitToExchange(exchangeService: ExchangeService, options: { remainingQuantity: number }): Promise<void> {
    this.quantity = options.remainingQuantity;
    this.exchangeOrder = await exchangeService.createMarketOrder(this.ticker, this.side, this.quantity);
    this.status = OrderStatus.Closed;
  }
}