import { OrderSide } from '../enums/order-side';
import { OrderStatus } from '../enums/order-status';
import { OrderTradeStep } from '../enums/order-trade-step';
import { OrderType } from '../enums/order-type';
import { Symbol } from '../models/symbol';
import Order from './order';

export default class Trade {
  symbol: Symbol;
  orders: Order[] = [];

  private get openTradeOrder(): Order {
    const openOrder = this.orders.find(x => x.step === OrderTradeStep.Open);
    if (!openOrder) throw new Error('No open order');
    return openOrder;
  }

  get isOpen(): boolean {
    return this.orders.findIndex(x => x.status === OrderStatus.Open || x.status === OrderStatus.Waiting) !== -1;
  }

  get side(): OrderSide {
    return this.openTradeOrder.side;
  }

  get remaining(): number {
    const quantityFilledInTakeProfits = this.orders.filter(x => x.step === OrderTradeStep.TakeProfit && x.status === OrderStatus.Closed)
      .reduce((prev, current) => prev + current.quantity, 0);
    return this.openTradeOrder.quantity - quantityFilledInTakeProfits;
  }

  constructor(symbol: Symbol, open: Order) {
    this.symbol = symbol;
    this.orders.push(open);
  }

  // Actuellement on ne fait que des LONG en Spot
  static openAtMarket = (symbol: Symbol, quantity: number): Trade => {
    const open = new Order(OrderType.Market, OrderSide.Buy, OrderTradeStep.Open, quantity);
    open.status = OrderStatus.Open;
    return new Trade(symbol, open);
  }

  addTakeProfit = (quantity: number, price: number): void => {
    if (quantity > this.openTradeOrder.quantity) throw new Error('Take profit quantity is too high.');
    const tp = new Order(OrderType.Limit, OrderSide.Sell, OrderTradeStep.TakeProfit, quantity, price);
    this.orders.push(tp);
  }

  addStopLoss = (price: number): void => {
    const sl = new Order(OrderType.Stop, OrderSide.Sell, OrderTradeStep.StopLoss, this.openTradeOrder.quantity, undefined, price);
    this.orders.push(sl);
  }

  getPerformance(): number | null {
    if (this.isOpen) return null;
    
    const openAmount = this.openTradeOrder.quantity * (this.openTradeOrder.exchange?.executedPrice ?? 0);

    const profitTaken = this.orders.filter(x => x.step === OrderTradeStep.TakeProfit && x.status === OrderStatus.Closed)
      .reduce((sum, order) => sum + order.quantity * (order.exchange?.executedPrice ?? 0), 0);

    const stopLoss = this.orders.find(x => x.step === OrderTradeStep.StopLoss && x.status === OrderStatus.Closed);
    const stopAmount = stopLoss ? stopLoss.quantity * (stopLoss.exchange?.executedPrice ?? 0) : 0;

    const closeOrder = this.orders.find(x => x.step === OrderTradeStep.Close && x.status === OrderStatus.Closed);
    const closeAmount = closeOrder ? closeOrder.quantity * (closeOrder.exchange?.executedPrice ?? 0) : 0;

    const finalAmount = profitTaken + stopAmount + closeAmount;

    const tradeDate = this.openTradeOrder.exchange ? new Date(this.openTradeOrder.exchange.timestamp) : null;
    if (tradeDate) console.log(`Trade\t${tradeDate}\t${openAmount}\t${profitTaken}\t${stopAmount}\t${closeAmount}`);

    return (finalAmount / openAmount - 1) * 100;

  }
}