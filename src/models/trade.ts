import { Guid } from 'guid-typescript';
import { ExchangeOrderStatus } from '../enums/exchange-order-status';
import { OrderSide } from '../enums/order-side';
import { OrderStatus } from '../enums/order-status';
import Ticker from '../models/ticker';
import Candlestick from './candlestick';
import LimitOrder from './orders/limit-order';
import MarketOrder from './orders/market-order';
import Order from './orders/order';
import StopOrder from './orders/stop-order';
import { StopLossMoveCondition } from './stop-loss-move-condition';

export default class Trade {
  id: Guid = Guid.create();
  open: MarketOrder | LimitOrder;
  takeProfits: LimitOrder[] = [];
  stopLoss: StopOrder | null = null;
  stopLossMoveCondition: StopLossMoveCondition | null = null;
  close: MarketOrder | null = null;
 
  private constructor(open: MarketOrder | LimitOrder) {
    this.open = open;
  }

  // Actuellement on ne fait que des LONG en Spot
  static openTrade = async (
    currentCandlestick: Candlestick,
    ticker: Ticker,
    quantity: number,
    takeProfits: { quantity: number, price: number }[] | null = null,
    stopLoss: number | null = null,
    stopLossMoveCondition: StopLossMoveCondition | null = null,
  ): Promise<Trade> => {
    const open = new MarketOrder(ticker, OrderSide.Buy, quantity);
    open.status = OrderStatus.Open;

    const trade = new Trade(open);

    // Create TPs and SL
    if (takeProfits) {
      takeProfits = takeProfits.sort((a, b) => a.price - b.price); // On ne fait que des longs pour l'instant, donc on tri par limit (inverser si on fait un short)
      const takeProfitsQuantity = takeProfits.reduce((sum, tp) => sum += tp.quantity, 0);
      if (takeProfitsQuantity > quantity) throw new Error('Take profit quantity is too high.');
      takeProfits.forEach(takeProfit => {
        trade.takeProfits.push(new LimitOrder(ticker, OrderSide.Sell, takeProfit.quantity, takeProfit.price));
      });
    }
    
    if (stopLoss) trade.stopLoss = new StopOrder(ticker, OrderSide.Sell, stopLoss);
    trade.stopLossMoveCondition = stopLossMoveCondition;

    // Transmit open order
    await open.transmitToExchange();
    await trade.synchronizeWithExchange(currentCandlestick.close);

    return trade;
  }

  get quantity(): number {
    return this.open.quantity;
  }

  get orders(): Order[] {
    const orders: Order[] = [this.open, ...this.takeProfits];
    if (this.stopLoss) orders.push(this.stopLoss);
    if (this.close) orders.push(this.close);
    return orders;
  }

  get remaining(): number {
    const quantityFilledInTakeProfits = this.takeProfits.filter(x => x.status === OrderStatus.Closed)
      .reduce((prev, current) => prev + current.quantity, 0);
          
    return this.quantity - quantityFilledInTakeProfits;
  }

  get isOpen(): boolean {
    return this.orders.findIndex(x => x.status === OrderStatus.Open || x.status === OrderStatus.Waiting) > -1;
  }

  synchronizeWithExchange = async (currentPrice: number): Promise<void> => {
    await this.synchronizeOpenOrdersWithExchange();
    this.openNextWaitingOrdersIfNoOpenOrders();
    await this.transmitToExchangeNextOpenOrder();
    await this.handleStopLoss(currentPrice);
  }

  async closeTrade(): Promise<void> {
    if (this.close) throw new Error('Close order should not exist yet.');
    await this.cancelAllOrders();
    this.close = new MarketOrder(this.open.ticker, OrderSide.Sell, this.remaining);
    await this.close.transmitToExchange();
  }

  /* Synchronize open orders with exchange (are order closed in exchange) */
  private async synchronizeOpenOrdersWithExchange(): Promise<void> {
    const ordersToSync = this.orders
      .filter(x => x.status === OrderStatus.Open && x.exchangeOrder?.status === ExchangeOrderStatus.Open);

    for (const order of ordersToSync) {
      await this.synchronizeOrderWithExchange(order);
    }
  }

  private async synchronizeOrderWithExchange(order: Order): Promise<void> {
    await order.synchronizeWithExchange();

    if (order.status === OrderStatus.Closed && this.orderIsTP1(order) && this.stopLossMoveCondition?.condition === 'tp1') {
      await this.moveStopLoss();
    }
    
    if (this.remaining === 0) await this.cancelAllOrders();
  }

  private openNextWaitingOrdersIfNoOpenOrders(): void {
    if (this.orders.filter(x => x.status === OrderStatus.Open).length > 0) return;

    const takeProfits = this.takeProfits.filter(x => x.status === OrderStatus.Waiting);
    if (takeProfits.length > 0) {
      const nextTp = takeProfits[0];
      nextTp.status = OrderStatus.Open;
    }

    if (this.stopLoss?.status === OrderStatus.Waiting) {
      this.stopLoss.status = OrderStatus.Open;
    }
  }

  private transmitToExchangeNextOpenOrder = async (): Promise<void> => {
    if (this.open && this.open.status === OrderStatus.Open && this.open.exchangeOrder === null) {
      await this.open.transmitToExchange();
      return;
    }

    // On ne transmet pas les stop loss pour l'instant (on ne transmet que les TPs)
    const takeProfit = this.takeProfits.find(x => x.status === OrderStatus.Open && x.exchangeOrder === null)
    if (!takeProfit) return;
    await takeProfit.transmitToExchange();
  }

  private async moveStopLoss(): Promise<void> {
    if (!this.stopLossMoveCondition) return;
    
    if (this.stopLoss && this.stopLoss.exchangeOrder?.status === ExchangeOrderStatus.Open) {
      await this.stopLoss?.cancel();
    }

    if (this.stopLossMoveCondition.newPosition !== 'breakEven' || !this.open.exchangeOrder?.executedPrice) return;

    const newStopLoss = this.open.exchangeOrder.executedPrice;    

    this.stopLoss = new StopOrder(this.open.ticker, OrderSide.Sell, newStopLoss);
    this.stopLoss.status = OrderStatus.Open;
  }

  private handleStopLoss = async (currentPrice: number): Promise<void> => {
    if (this.stopLoss?.status !== OrderStatus.Open) return;

    if (!this.stopLoss.limit || currentPrice >= this.stopLoss.limit) return;
    
    await this.cancelAllOrders();
    this.stopLoss.status = OrderStatus.Open;
    await this.stopLoss.transmitToExchange({ remainingQuantity: this.remaining });
  }

  /* Cancel all open and waiting orders
   */
  private cancelAllOrders = async (): Promise<void> => {
    const toBeCanceledOrders = this.orders
      .filter(order => order.status === OrderStatus.Waiting || order.status === OrderStatus.Open);

    for (const order of toBeCanceledOrders) {
      await order.cancel();
    }
  }
  
  private orderIsTP1 = (order: Order): boolean => this.takeProfits.findIndex(x => x.id === order.id) === 0;
}