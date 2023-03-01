import { timestampToString } from '../helpers/date';
import TradeHelper from '../helpers/trade.helper';
import Order from '../models/order';
import Trade from '../models/trade';
import TradePerformance from './trade-performance';

export default class PerformanceCalculator {
  static getPerformance(trades: Trade[]): void {
    const initialAmount = 1000;
    let capital = initialAmount;
    let wonTrades = 0;
    let lostTrades = 0;

    trades.forEach(trade => {
      const perf = this.getTradePerformance(trade);
      if (!perf) return;

      console.log(timestampToString(perf.openTimestamp),
        timestampToString(perf.closeTimestamp),
        perf.pnl,
        this.toPercentage(perf.pnlPercent * 100));
        
      const pnl = perf.pnl;
      capital += pnl;
      if (pnl >= 0) wonTrades++;
      if (pnl < 0) lostTrades++;
    });

    const totalPerformance = (capital / initialAmount - 1) * 100;
    const winRate = (wonTrades / (wonTrades + lostTrades)) * 100;

    console.log(`Total performance: ${this.toPercentage(totalPerformance)}\tWin: ${wonTrades}\tLoss: ${lostTrades}\tWinRate: ${this.toPercentage(winRate)}`);
  }

  static getTradePerformance(trade: Trade): TradePerformance | null {
    if (trade.isOpen) return null;

    const openOrders = TradeHelper.openOrders(trade);
    const openTimestamp = Math.min(...openOrders.map(order => order.exchangeOrder?.timestamp ?? Number.MAX_SAFE_INTEGER));
    const closeOrders = [...TradeHelper.takeProfitsOrders(trade), ...TradeHelper.stopLossOrders(trade)];
    const closeTimestamp = Math.max(...closeOrders.map(order => order.exchangeOrder?.timestamp ?? 0));

    const openAmount = this.getAmount(openOrders);
    const finalAmount = this.getAmount(closeOrders);
    const pnl = finalAmount - openAmount;
    const pnlPercent = pnl / openAmount;

    return { pnl, pnlPercent, openTimestamp, closeTimestamp };
  }
  
  private static getAmount = (orders: Order[]) => orders
    .reduce((amount, order) => {
      const quantity = order.quantity !== 'remaining' ? order.quantity : 0;
      const price = order.exchangeOrder?.executedPrice ?? 0;
      const fees = order.exchangeOrder?.fee?.amount ?? 0;
      return amount + quantity * price - fees;
    }, 0);

  private static toPercentage = (n: number): string => `${n.toFixed(2)}%`;
}