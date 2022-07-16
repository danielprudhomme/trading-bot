import Order from './order';

export default class Trade {
  openOrder: Order;
  closeOrder: Order | null = null;
  pnl: number = 0;
  performance: number = 0;
  isOpen: boolean;

  constructor(timestamp: number, price: number, quantity: number) {
    this.openOrder = new Order(timestamp, price, quantity);
    this.isOpen = true;
  }

  close(timestamp: number, price: number, quantity: number) {
    this.closeOrder = new Order(timestamp, price, quantity);
    this.isOpen = false;
    this.pnl = this.getOrderValue(this.closeOrder) - this.getOrderValue(this.openOrder);
    this.performance = this.pnl / this.getOrderValue(this.openOrder);
  }

  getOrderValue(order: Order) {
    return order.price * order.quantity;
  }
}