import { OrderSide } from '../../enums/order-side';
import { OrderStatus } from '../../enums/order-status';
import ExchangeService from '../../exchange-service/exchange.service';
import Ticker from '../ticker';
import Order from './order';

export default class MarketOrder extends Order {
  quantity: number;

  constructor(ticker: Ticker, side: OrderSide, quantity: number) {
    super(ticker, side, quantity);
    this.quantity = quantity;
  }

  async transmitToExchange(exchangeService: ExchangeService): Promise<void> {
    this.exchangeOrder = await exchangeService.createMarketOrder(this.ticker, this.side, this.quantity);
    this.status = OrderStatus.Closed;
  }
}