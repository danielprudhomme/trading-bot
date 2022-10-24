import { OrderStatus } from './enums/order-status';
import Trade from './models/trade';

export default class PerformanceCalculator {
  static getPerformance(trades: Trade[]): void {
    const initialAmount = 100;
    let capital = initialAmount;
    let wonTrades = 0;
    let lostTrades = 0;

    trades.forEach(trade => {
      const performance = this.getTradePerformance(trade);
      if (performance) {
        capital += capital * performance / 100;

        if (performance >= 0) wonTrades++;
        if (performance < 0) lostTrades++;
      }
    });

    const totalPerformance = (capital / initialAmount - 1) * 100;
    const winRate = (wonTrades / (wonTrades + lostTrades)) * 100;

    console.log(`Performance totale: ${this.toPercentage(totalPerformance)}\tWin: ${wonTrades}\tLoss: ${lostTrades}\tWinRate: ${this.toPercentage(winRate)}`);
  }

  private static getTradePerformance(trade: Trade): number | null {
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
    const performance = (finalAmount / openAmount - 1) * 100;
    if (thisDate) console.log(`Trade\t${thisDate}\topen: ${openAmount}\ttp: ${profitTaken}\tstop: ${stopAmount}\tclose: ${closeAmount}\t -> ${this.toPercentage(performance)}`);

    return performance;
  }

  private static toPercentage = (n: number): string => `${n.toFixed(2)}%`
}