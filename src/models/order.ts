import { Guid } from 'guid-typescript';
import { OrderSide } from '../enums/order-side';
import { OrderStatus } from '../enums/order-status';
import { OrderTradeStep } from '../enums/order-trade-step';
import { OrderType } from '../enums/order-type';
import ExchangeOrder from './exchange-order';

export default class Order {
  id: Guid = Guid.create();
  exchange: ExchangeOrder | null = null;
  type: OrderType;
  side: OrderSide;
  step: OrderTradeStep;
  status: OrderStatus = OrderStatus.Waiting;
  limit: number | null;
  stop: number | null;
  quantity: number;

  constructor(
    type: OrderType,
    side: OrderSide,
    step: OrderTradeStep,
    quantity: number,
    limit?: number,
    stop?: number,
  ) {
    this.type = type;
    this.side = side;
    this.step = step;
    this.quantity = quantity;
    this.limit = limit ?? null;
    this.stop = stop ?? null;
    this.checkIsValid();
  }

  private checkIsValid() {
    if (this.step === OrderTradeStep.TakeProfit && this.type !== OrderType.Limit) {
      throw new Error('Take Profit order should be a limit order.');
    }
    if (this.type === OrderType.Market && (this.limit !== null || this.stop !== null)) {
      throw new Error('Market order should not have limit and stop.');
    }
    if (this.type === OrderType.Limit && (this.limit === null || this.stop !== null)) {
      throw new Error('Limit order should have limit and should not have stop.');
    }
    if (this.type === OrderType.Stop && (this.limit !== null || this.stop === null)) {
      throw new Error('Limit order should have limit and should not have stop.');
    }
    if (this.type === OrderType.StopLimit && (this.limit === null || this.stop === null)) {
      throw new Error('Limit order should have limit and stop.');
    }
  }
}