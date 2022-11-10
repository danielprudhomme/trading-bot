import { OrderSide } from '../enums/order-side';
import { OrderStatus } from '../enums/order-status';
import ExchangeOrder from './exchange-order';

export default interface Order {
  step: 'open' | 'takeProfit' | 'stopLoss';
  type: 'market' | 'limit' | 'stop';
  side: OrderSide;
  status: OrderStatus;
  quantity: number | 'remaining';
  limit?: number;
  exchangeOrder?: ExchangeOrder;
}
