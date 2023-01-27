import { Guid } from 'guid-typescript';
import TradeHelper from '../helpers/trade.helper';
import TradeRepository from '../infrastructure/repositories/trade.repository';
import Order from '../models/order';
import { StopLossMoveCondition } from '../models/stop-loss-move-condition';
import Ticker from '../models/ticker';
import Trade from '../models/trade';
import Workspace from '../workspace';
import OrderService from './order.service';
import StopLossService from './stop-loss.service';

export default class TradeService {
  private orderService: OrderService;
  private stopLossService: StopLossService;
  private tradeRepository: TradeRepository;

  constructor(
    orderService: OrderService,
    stopLossService: StopLossService,
    tradeRepository: TradeRepository,
  ) {
    this.orderService = orderService;
    this.stopLossService = stopLossService;
    this.tradeRepository = tradeRepository;
  }

  deleteAll = async (): Promise<void> => await this.tradeRepository.deleteAll();
  getAll = async (): Promise<Trade[]> => await this.tradeRepository.getAll();
  getAllOpen = async (): Promise<Trade[]> => await this.tradeRepository.getAllOpen();

  persistUpdatedTrades = async (trades: Trade[]): Promise<void> => await this.tradeRepository.updateMultiple(trades.filter(trade => trade.updated));
  
  // Actuellement on ne fait que des LONG en Spot
  openTrade = async (
    ticker: Ticker,
    quantity: number,
    takeProfits: { quantity: number, price: number }[] | null = null,
    stopLoss: number | null = null,
    stopLossMoveCondition: StopLossMoveCondition | null = null,
  ): Promise<Trade> => {
    const open: Order = {
      step: 'open',
      type: 'market',
      side: 'buy',
      status: 'open',
      quantity,
    };

    const trade: Trade = {
      id: Guid.create().toString(),
      ticker,
      isOpen: true,
      orders: [ open ],
      updated: true,
    };

    // Create TPs and SL
    if (takeProfits) {
      takeProfits = takeProfits.sort((a, b) => a.price - b.price); // On ne fait que des longs pour l'instant, donc on tri par limit (inverser si on fait un short)
      const takeProfitsQuantity = takeProfits.reduce((sum, tp) => sum += tp.quantity, 0);
      if (takeProfitsQuantity > quantity) throw new Error('Take profit quantity is too high.');

      const tpOrders: Order[] = takeProfits.map(takeProfit => ({
          step: 'takeProfit',
          type: 'limit',
          side: 'sell',
          status: 'waiting',
          quantity: takeProfit.quantity,
          limit: takeProfit.price,
      }));
      trade.orders.push(...tpOrders);
    }
    
    if (stopLoss) {
      const slOrder: Order = {
        step: 'stopLoss',
        type: 'stop',
        side: 'sell',
        status: 'waiting',
        quantity: 'remaining',
        limit: stopLoss,
      };
      trade.orders.push(slOrder);
    }

    if (stopLossMoveCondition) trade.stopLossMoveCondition = stopLossMoveCondition;

    // Transmit open order
    await this.orderService.transmitToExchange(trade, open);
    await this.synchronizeWithExchange(trade);

    return trade;
  }

  async closeTrade(trade: Trade): Promise<void> {
    const entryPrice = TradeHelper.entryPrice(trade);
    if (!entryPrice) throw new Error('Cannot close a not opened order.');
    
    await this.cancelAllOrders(trade);

    const chart = Workspace.getChart(trade.ticker);
    if (!chart) return;
    const currentPrice = chart.candlesticks[0].close;

    const closeOrder: Order = {
      step: currentPrice >= entryPrice ? 'takeProfit' : 'stopLoss',
      type: 'market',
      side: 'sell',
      status: 'open',
      quantity: 'remaining',
    };
    trade.orders.push(closeOrder);
    
    await this.orderService.transmitToExchange(trade, closeOrder);

    trade.isOpen = false;
    trade.updated = true;
  }

  synchronizeWithExchange = async (trade: Trade): Promise<void> => {
    await this.synchronizeOpenOrdersWithExchange(trade);

    if (trade.updated) {
      if (TradeHelper.remainingQuantity(trade) === 0) {
        await this.cancelAllOrders(trade);
        trade.isOpen = false;
      }
      else {
        await this.stopLossService.moveStopLossIfNeeded(trade);
        this.openNextWaitingOrdersIfNoOpenOrders(trade);
        await this.transmitToExchangeNextOpenOrder(trade);
      }
    }

    await this.stopLossService.handleStopLoss(trade);
  }

  /* Synchronize open orders with exchange (are order closed in exchange) */
  private async synchronizeOpenOrdersWithExchange(trade: Trade): Promise<void> {
    const ordersToSync = trade.orders.filter(order => order.status === 'open' && order.exchangeOrder?.status === 'open');

    for (const order of ordersToSync) {
      await this.orderService.synchronizeWithExchange(trade, order);
    }
  }

  /* Cancel all open and waiting orders */
  private async cancelAllOrders(trade: Trade): Promise<void> {
    const toBeCanceledOrders = trade.orders.filter(order => order.status === 'waiting' || order.status === 'open');

    for (const order of toBeCanceledOrders) {
      await this.orderService.cancel(trade, order);
    }
  }
  
  private openNextWaitingOrdersIfNoOpenOrders(trade: Trade): void {
    if (trade.orders.filter(order => order.status === 'open').length > 0) return;

    const takeProfits = TradeHelper.takeProfitsOrders(trade).filter(order => order.status === 'waiting');
    if (takeProfits.length > 0) takeProfits[0].status = 'open';

    const stopLosses = TradeHelper.stopLossOrders(trade).filter(order => order.status === 'waiting');
    if (stopLosses.length > 0) stopLosses[0].status = 'open';
  }

  private transmitToExchangeNextOpenOrder = async (trade: Trade): Promise<void> => {
    // TODO: factoriser => on fait la même chose pour open et tps
    const openOrders = TradeHelper.openOrders(trade).filter(order => order.status === 'open' && !order.exchangeOrder);
    if (openOrders.length > 0) {
      this.orderService.transmitToExchange(trade, openOrders[0]);
    }

    // On ne transmet pas les stop loss pour l'instant (on ne transmet que les TPs)
    const takeProfits = TradeHelper.takeProfitsOrders(trade).filter(order => order.status === 'open' && !order.exchangeOrder);
    if (takeProfits.length > 0) {
      this.orderService.transmitToExchange(trade, takeProfits[0]);
    }
  }
}