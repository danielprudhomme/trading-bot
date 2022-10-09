import { ExchangeOrderStatus } from './enums/exchange-order-status';
import { OrderSide } from './enums/order-side';
import { OrderStatus } from './enums/order-status';
import { OrderTradeStep } from './enums/order-trade-step';
import { OrderType } from './enums/order-type';
import ExchangeService from './exchange-service/exchange.service';
import Candlestick from './models/candlestick';
import Order from './models/order';
import { Symbol } from './models/symbol';
import Trade from './models/trade';

export default class TradeManager {
  exchangeService: ExchangeService;
  trades: Trade[] = [];

  constructor(exchangeService: ExchangeService) {
    this.exchangeService = exchangeService;
  }

  create = async (trade: Trade, currentCandlestick: Candlestick): Promise<void> => {
    this.trades.push(trade);
    await this.sync(trade, currentCandlestick);
  }

  close = async (trade: Trade, currentCandlestick: Candlestick): Promise<void> => {
    this.cancelAllOrders(trade);

    // Close position with remaining quantity
    const closeOrder = new Order(
      OrderType.Market,
      OrderSide.getOpposite(trade.side),
      OrderTradeStep.Close,
      trade.remaining
    );
    closeOrder.status = OrderStatus.Open;

    trade.orders.push(closeOrder);
    
    await this.sync(trade, currentCandlestick);
  }

  syncAll = async (currentCandlestick: Candlestick): Promise<void> => {
    for (const trade of this.trades.filter(x => x.isOpen)) {
      await this.sync(trade, currentCandlestick);
    }
  }

  getPerformance = (): void => {
    // somme des perfs de chaque trade, pas d'intérets composés ici
    const sumPerf = this.trades.reduce((sum, trade, i) => {
      const perf = trade.getPerformance();
      console.log('perf ' + i, perf);
      return sum + (perf ?? 0);
    }, 0);
    console.log('perf globale : ', sumPerf);
  }

  private sync = async (trade: Trade, currentCandlestick: Candlestick): Promise<void> => {
    await this.syncCanceledOrdersWithExchange(trade);
    await this.syncOpenOrdersWithExchange(trade); // TODO : si le dernier TP est passé (remaining = 0), on cancel tout le reste
    
    // Si on a plus d'ordres ouverts, ouvrir les ordres waiting
    this.openNextWaitingOrdersIfNoOpenOrders(trade);

    // Transmettre les ordres ouverts sur l'exchange
    // On transmet les ordres limit (take profit), les stop loss
    await this.transmitNextOpenOrderToTransmit(trade);

    // Si on a un stop loss (pour l'instant pas envoyer directement sur l'exchange)
    await this.checkAndTransmitStopLoss(trade, currentCandlestick);
  }

  private syncOpenOrdersWithExchange = async (trade: Trade): Promise<void> => {
    // Sync orders open in exchange : check if order is closed in exchange
    const ordersToSync = trade.orders
      .filter(x => x.status === OrderStatus.Open && x.exchange?.status === ExchangeOrderStatus.Open);

    for (const order of ordersToSync) {
      if (order.exchange) {
        const exchangeOrder = await this.exchangeService.fetchOrder(trade.symbol, order.exchange?.id);
        if (exchangeOrder) {
          order.exchange = exchangeOrder;
          if (order.exchange.status === ExchangeOrderStatus.Closed) {
            order.status = OrderStatus.Closed;
            if (trade.remaining === 0) {
              this.cancelAllOrders(trade);
            }
          }
        }
      }
    }
  }

  private syncCanceledOrdersWithExchange = async (trade: Trade): Promise<void> => {
    // Cancel orders to be cancelled in exchange (canceled in bot but open in exchange)
    const ordersToCancel = trade.orders
      .filter(x => x.status === OrderStatus.Canceled && x.exchange?.status == ExchangeOrderStatus.Open);
    for (const order of ordersToCancel) {
      if (order.exchange?.id) {
        await this.exchangeService.cancelOrder(trade.symbol, order.exchange?.id);
        order.status = OrderStatus.Canceled;
      }
    }
  }

  private openNextWaitingOrdersIfNoOpenOrders(trade: Trade): void {
    if (trade.orders.filter(x => x.status === OrderStatus.Open).length === 0) {

      // On ne fait que des longs pour l'instant, donc on tri par limit (inverser si on fait un short)
      const takeProfits = trade.orders.filter(x => x.step === OrderTradeStep.TakeProfit && x.status === OrderStatus.Waiting)
        .sort((a, b) => (a.limit ?? 0) - (b.limit ?? 0));

      if (takeProfits.length > 0) {
        const nextTp = takeProfits[0];
        nextTp.status = OrderStatus.Open;
      }

      const stopLoss = trade.orders.find(x => x.step === OrderTradeStep.StopLoss && x.status === OrderStatus.Waiting)
      if (stopLoss) {
        stopLoss.status = OrderStatus.Open;
      }
    }
  }

  private transmitNextOpenOrderToTransmit = async (trade: Trade): Promise<void> => {
    const openOrders = trade.orders.filter(x => x.status === OrderStatus.Open && x.exchange === null);

    if (openOrders.length === 0) return;

    let nextOpenOrder = openOrders.find(x => x.step === OrderTradeStep.Open);
    if (!nextOpenOrder) nextOpenOrder = openOrders.find(x => x.step === OrderTradeStep.Close);
    if (!nextOpenOrder) nextOpenOrder = openOrders.find(x => x.step === OrderTradeStep.TakeProfit);
    // On ne transmet pas les stop loss pour l'instant (on ne transmet que les TPs)
    
    if (nextOpenOrder) await this.transmitOrder(trade.symbol, nextOpenOrder);
  }

  private checkAndTransmitStopLoss = async (trade: Trade, currentCandlestick: Candlestick): Promise<void> => {
    const lastClosePrice = currentCandlestick.close;
    const openSl = trade.orders.find(x => x.step === OrderTradeStep.StopLoss && x.status === OrderStatus.Open);
    if (openSl?.stop && lastClosePrice < openSl.stop) {
      this.cancelAllOrders(trade);
      await this.syncCanceledOrdersWithExchange(trade);
      
      openSl.quantity = trade.remaining;
      await this.transmitOrder(trade.symbol, openSl, OrderType.Market);
    }
  }

  private cancelAllOrders = (trade: Trade): void => {
    // Cancel all open and waiting orders
    trade.orders.filter(order => order.status === OrderStatus.Waiting || order.status === OrderStatus.Open)
      .forEach(order => order.status = OrderStatus.Canceled);
  }

  private transmitOrder = async (symbol: Symbol, order: Order, type?: OrderType): Promise<void> => {
    type = type ?? order.type;
    
    if (type === OrderType.Market) {
      order.exchange = await this.exchangeService.createMarketOrder(symbol, order.side, order.quantity);
      order.status = OrderStatus.Closed;
    }
    else if (type === OrderType.Limit && order.limit) {
      order.exchange = await this.exchangeService.createlimitOrder(symbol, order.side, order.limit, order.quantity);
    }
    else {
      throw new Error('transmitOrder not yet implemented for this order type.');
    }
  }
}
