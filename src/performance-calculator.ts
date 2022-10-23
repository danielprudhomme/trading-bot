import { OrderStatus } from './enums/order-status';
import Trade from './models/trade';

export default class PerformanceCalculator {
  static getTradePerformance(trade: Trade): number | null {
    if (trade.isOpen) return null;
    
    const openAmount = trade.quantity * (trade.open.exchangeOrder?.executedPrice ?? 0);

    const profitTaken = trade.takeProfits.filter(x => x.status === OrderStatus.Closed)
      .reduce((sum, order) => sum + order.quantity * (order.exchangeOrder?.executedPrice ?? 0), 0);

    const stopAmount = trade.stopLoss && trade.stopLoss.status === OrderStatus.Closed ?
      (trade.stopLoss.quantity as number) * (trade.stopLoss?.exchangeOrder?.executedPrice ?? 0) : 0;

    const closeAmount = trade.close && trade.close.status === OrderStatus.Closed ?
      trade.close.quantity * (trade.close.exchangeOrder?.executedPrice ?? 0) : 0;

    const finalAmount = profitTaken + stopAmount + closeAmount;

    const thisDate = trade.open.exchangeOrder ? new Date(trade.open.exchangeOrder.timestamp).toUTCString(): null;
    if (thisDate) console.log(`Trade\t${thisDate}\topen: ${openAmount}\ttp: ${profitTaken}\tstop: ${stopAmount}\tclose: ${closeAmount}`);

    return (finalAmount / openAmount - 1) * 100;
  }
}