import Order from '../models/order';
import Trade from '../models/trade';

export default class TradeHelper {
  static openOrders = (trade: Trade): Order[] => trade.orders.filter(order => order.step === 'open');
  static takeProfitsOrders = (trade: Trade): Order[] => trade.orders.filter(order => order.step === 'takeProfit');
  static stopLossOrders = (trade: Trade): Order[] => trade.orders.filter(order => order.step === 'stopLoss');

  static remainingQuantity(trade: Trade): number {
    const filledQuantityInOpenOrders = this.openOrders(trade).filter(order => order.status === 'closed')
      .reduce((quantity, order) => quantity + (order.quantity as number), 0);

    const filledQuantityInTakeProfits = this.takeProfitsOrders(trade).filter(order => order.status === 'closed')
    .reduce((quantity, order) => quantity + (order.quantity as number), 0);

    return filledQuantityInOpenOrders - filledQuantityInTakeProfits;
  }

  // TODO : calculer le PRU (moyenne des prix d'entrée) => pas géré si on a plusieurs openOrders
  static entryPrice(trade: Trade): number | null {
    const openOrders = this.openOrders(trade);
    const entryPrice = openOrders.length > 0 ? openOrders[0].exchangeOrder?.executedPrice ?? null : null;
    return entryPrice;
  }
}