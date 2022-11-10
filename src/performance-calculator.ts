import { timestampToString } from './helpers/date';
import TradeHelper from './helpers/trade.helper';
import Order from './models/order';
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
    
    const openAmount = this.getAmount(TradeHelper.openOrders(trade));
    const finalAmount = this.getAmount([...TradeHelper.takeProfitsOrders(trade), ...TradeHelper.stopLossOrders(trade)]);

    const openOrder = TradeHelper.openOrders(trade)[0];
    const thisDate = openOrder.exchangeOrder ? timestampToString(openOrder.exchangeOrder.timestamp) : null;
    const performance = (finalAmount / openAmount - 1) * 100;
    if (thisDate) console.log(`Trade\t${thisDate}\t open: ${openAmount}\tfinal: ${finalAmount}\t -> ${this.toPercentage(performance)}`);

    return performance;
  }
  
  private static getAmount = (orders: Order[]) => orders
    .reduce((amount, order) => {
      const quantity = order.quantity !== 'remaining' ? order.quantity : 0;
      const price = order.exchangeOrder?.executedPrice ?? 0;
      return amount + quantity * price;
    }, 0);

  private static toPercentage = (n: number): string => `${n.toFixed(2)}%`;
}