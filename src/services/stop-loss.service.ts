import TradeHelper from '../helpers/trade.helper';
import Order from '../models/order';
import Trade from '../models/trade';
import Workspace from '../workspace/workspace';
import OrderService from './order.service';

export default class StopLossService {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  async moveStopLossIfNeeded(trade: Trade): Promise<void> {
    if (trade.stopLossMoveCondition?.condition !== 'tp1') return;

    const filledTps = TradeHelper.takeProfitsOrders(trade).filter(order => order.status === 'closed');
    const unfilledTps = TradeHelper.takeProfitsOrders(trade).filter(order => order.status !== 'closed');
    const orderWasTp1 = filledTps.length === 1 && unfilledTps.length > 0;

    if (orderWasTp1) await this.moveStopLoss(trade);
  }

  async handleStopLoss(trade: Trade): Promise<void> {
    // On ne prend en compte que les cas où on a un seul stop loss
    const stopLossOrders = TradeHelper.stopLossOrders(trade);
    const stopLoss = stopLossOrders.length > 0 ? stopLossOrders[0] : null;

    if (stopLoss?.status !== 'open') return;

    const chart = Workspace.getChart(trade.ticker);
    if (!chart) return;
    const currentPrice = chart.candlesticks[0].close;
    if (!stopLoss.limit || currentPrice >= stopLoss.limit) return;
    
    // Cancel all 
    const nonStopLossOrders = trade.orders.filter(order => (order.step === 'open' || order.step === 'takeProfit') && (order.status === 'open' || order.status === 'waiting'));
    for (const order of nonStopLossOrders) {
      await this.orderService.cancel(trade, order);
    }
    stopLoss.status = 'open';
    await this.orderService.transmitToExchange(trade, stopLoss);
    trade.updated = true;
    trade.isOpen = false;
  }

  private async moveStopLoss(trade: Trade): Promise<void> {
    if (!trade.stopLossMoveCondition) return;
    
    // On ne prend en compte que les cas où on a un seul stop loss
    const stopLossOrders = TradeHelper.stopLossOrders(trade);
    const stopLoss = stopLossOrders.length > 0 ? stopLossOrders[0] : null;
    if (stopLoss && stopLoss.exchangeOrder?.status === 'open') {
      await this.orderService.cancel(trade, stopLoss);
    }

    if (trade.stopLossMoveCondition.newPosition !== 'breakEven') return;
    const breakEvenPrice = TradeHelper.entryPrice(trade);
    if (!breakEvenPrice) return;

    const newStopLoss: Order = {
      step: 'stopLoss',
      type: 'stop',
      side: 'sell',
      status: 'open',
      quantity: 'remaining',
      limit: breakEvenPrice,
    };

    trade.orders.push(newStopLoss);
  }
}