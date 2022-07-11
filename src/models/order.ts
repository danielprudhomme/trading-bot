export default class Order {
  timestamp: number;
  price: number;
  quantity: number;

  constructor(timestamp: number, price: number, quantity: number) {
    this.timestamp = timestamp;
    this.price = price;
    this.quantity = quantity;
  }
}