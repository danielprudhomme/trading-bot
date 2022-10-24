import { OrderSide } from '../../enums/order-side';
import { OrderStatus } from '../../enums/order-status';
import ExchangeService from '../../exchange-service/exchange.service';
import { Symbol } from '../symbol';
import Order from './order';

export default class MarketOrder extends Order {
  quantity: number;

  constructor(symbol: Symbol, side: OrderSide, quantity: number) {
    super(symbol, side, quantity);
    this.quantity = quantity;
  }

  async transmitToExchange(exchangeService: ExchangeService): Promise<void> {
    this.exchangeOrder = await exchangeService.createMarketOrder(this.symbol, this.side, this.quantity);
    this.status = OrderStatus.Closed;
  }
}