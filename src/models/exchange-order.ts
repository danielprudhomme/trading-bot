import ccxt from 'ccxt';
import { ExchangeOrderStatus } from "../enums/exchange-order-status";

export default class ExchangeOrder {
  id: string;
  timestamp: number;
  status: ExchangeOrderStatus;
  executedPrice: number | null;

  constructor(id: string, timestamp: number, status: ExchangeOrderStatus, executedPrice: number | null) {
    this.id = id;
    this.timestamp = timestamp;
    this.status = status;
    this.executedPrice = executedPrice;
  }

  static mapCcxtOrder = (order: ccxt.Order): ExchangeOrder => new ExchangeOrder(
    order.id,
    order.timestamp,
    ExchangeOrderStatus.fromCcxtOrderStatus(order.status),
    order.average ?? null
  );
}