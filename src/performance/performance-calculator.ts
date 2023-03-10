import { timestampToString } from '../helpers/date';
import TradeHelper from '../helpers/trade.helper';
import Order from '../models/order';
import Trade from '../models/trade';
import TradePerformance from './trade-performance';

export default class PerformanceCalculator {
  static getPerformance(initialAmount: number, trades: Trade[]): void {
    let amount = initialAmount;
    let highestAmount = initialAmount;
    let maxDrawdown = 0;
    let wonTrades = 0;

    trades.forEach((trade, i) => {
      const performance = this.getTradePerformance(trade);
      if (!performance) return;

      amount += performance.pnl;
      highestAmount = Math.max(highestAmount, amount);
      const drawdown = amount / highestAmount - 1;
      maxDrawdown = Math.min(maxDrawdown, drawdown);

      console.log(i, '\t', timestampToString(performance.openTimestamp), '\t', this.toPercentage(performance.pnlPercent), '\t', 'PNL', performance.pnl.toFixed(2), '\tAmount', amount.toFixed(2), '\t', this.toPercentage(maxDrawdown))

      if (performance.pnl > 0) wonTrades++;
    });

    const totalPerformance = amount / initialAmount - 1;
    const winRate = wonTrades / trades.length;

    console.log('-------------- Performance --------------');
    console.log('Result: ', amount, `${totalPerformance > 0 ? '+' : ''}${this.toPercentage(totalPerformance)}`);
    console.log('Trades taken: ', trades.length, 'Win rate: ', this.toPercentage(winRate));
    console.log('Max Drawdown', this.toPercentage(maxDrawdown));
  }

  static getTradePerformance(trade: Trade): TradePerformance | null {
    if (trade.isOpen) return null;

    const openOrders = TradeHelper.openOrders(trade).filter(x => x.status === 'closed');
    const openTimestamp = Math.min(...openOrders.map(order => order.exchangeOrder?.timestamp ?? Number.MAX_SAFE_INTEGER));
    const closeOrders = [...TradeHelper.takeProfitsOrders(trade), ...TradeHelper.stopLossOrders(trade)].filter(x => x.status === 'closed');
    const closeTimestamp = Math.max(...closeOrders.map(order => order.exchangeOrder?.timestamp ?? 0));

    const openAmount = this.getAmount(openOrders, 'open');
    const finalAmount = this.getAmount(closeOrders, 'close');
    const pnl = finalAmount - openAmount;
    const pnlPercent = pnl / openAmount;

    return { pnl, pnlPercent, openTimestamp, closeTimestamp };
  }
  
  // Amount paid to open order, and amount received after closed
  private static getAmount = (orders: Order[], side: 'open' | 'close') => orders
    .reduce((amount, order) => {
      const quantity = order.quantity !== 'remaining' ? order.quantity : 0;
      const price = order.exchangeOrder?.executedPrice ?? 0;
      const fees = (order.exchangeOrder?.fee?.amount ?? 0) * (side === 'close' ? -1 : 1);
      return amount + quantity * price + fees;
    }, 0);

  private static toPercentage = (n: number): string => `${(n * 100).toFixed(2)}%`;
}