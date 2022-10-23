import { ExchangeOrderStatus } from '../enums/exchange-order-status';
import { OrderSide } from '../enums/order-side';
import { OrderStatus } from '../enums/order-status';
import ExchangeService from '../exchange-service/exchange.service';
import { Symbol } from '../models/symbol';
import Candlestick from './candlestick';
import LimitOrder from './orders/limit-order';
import MarketOrder from './orders/market-order';
import Order from './orders/order';
import StopOrder from './orders/stop-order';

export default class Trade {
  open: MarketOrder | LimitOrder;
  takeProfits: LimitOrder[] = [];
  stopLoss: StopOrder | null = null;
  close: MarketOrder | null = null;

  private constructor(open: MarketOrder | LimitOrder) {
    this.open = open;
  }

  // Actuellement on ne fait que des LONG en Spot
  static openTrade = (currentCandlestick: Candlestick, exchangeService: ExchangeService, symbol: Symbol, quantity: number, takeProfits: { quantity: number, price: number }[] | null = null, stopLoss: number | null = null): Trade => {
    const open = new MarketOrder(symbol, OrderSide.Buy, quantity);
    open.status = OrderStatus.Open;

    const trade = new Trade(open);

    // Create TPs and SL
    if (takeProfits) {
      const takeProfitsQuantity = takeProfits.reduce((sum, tp) => sum += tp.quantity, 0);
      if (takeProfitsQuantity > quantity) throw new Error('Take profit quantity is too high.');
      takeProfits.forEach(takeProfit => {
        trade.takeProfits.push(new LimitOrder(symbol, OrderSide.Sell, takeProfit.quantity, takeProfit.price));
      });
    }
    
    if (stopLoss) {
      trade.stopLoss = new StopOrder(symbol, OrderSide.Sell, stopLoss);
    }

    // Transmit open order
    open.transmitToExchange(exchangeService);
    trade.synchronizeWithExchange(currentCandlestick, exchangeService);

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

  synchronizeWithExchange = async (currentCandlestick: Candlestick, exchangeService: ExchangeService): Promise<void> => {
    await this.synchronizeOpenOrdersWithExchange(exchangeService);
    this.openNextWaitingOrdersIfNoOpenOrders();
    await this.transmitToExchangeNextOpenOrder(exchangeService);
    await this.checkAndtransmitToExchangeStopLoss(currentCandlestick, exchangeService);
  }

  /* Synchronize open orders with exchange (are order closed in exchange) */
  private async synchronizeOpenOrdersWithExchange(exchangeService: ExchangeService): Promise<void> {
    const ordersToSync = this.orders
      .filter(x => x.status === OrderStatus.Open && x.exchangeOrder?.status === ExchangeOrderStatus.Open);

    for (const order of ordersToSync) {
      await order.synchronizeWithExchange(exchangeService);
      if (this.remaining === 0) await this.cancelAllOrders(exchangeService);
    }
  }

  private openNextWaitingOrdersIfNoOpenOrders(): void {
    if (this.orders.filter(x => x.status === OrderStatus.Open).length > 0) return;

    // On ne fait que des longs pour l'instant, donc on tri par limit (inverser si on fait un short)
    const takeProfits = this.takeProfits.filter(x => x.status === OrderStatus.Waiting)
      .sort((a, b) => (a.limit ?? 0) - (b.limit ?? 0));

    if (takeProfits.length > 0) {   
      const nextTp = takeProfits[0];
      nextTp.status = OrderStatus.Open;
    }

    if (this.stopLoss?.status === OrderStatus.Waiting) {
      this.stopLoss.status = OrderStatus.Open;
    }
  }

  private transmitToExchangeNextOpenOrder = async (exchangeService: ExchangeService): Promise<void> => {
    if (this.open && this.open.status === OrderStatus.Open && this.open.exchangeOrder === null) {
      await this.open.transmitToExchange(exchangeService);
      return;
    }

    // On ne transmet pas les stop loss pour l'instant (on ne transmet que les TPs)
    const takeProfit = this.takeProfits.find(x => x.status === OrderStatus.Open && x.exchangeOrder === null)
    if (!takeProfit) return;
    await takeProfit.transmitToExchange(exchangeService);
  }

  private checkAndtransmitToExchangeStopLoss = async (currentCandlestick: Candlestick, exchangeService: ExchangeService): Promise<void> => {
    if (this.stopLoss?.status !== OrderStatus.Open) return;

    const lastClosePrice = currentCandlestick.close;
    if (!this.stopLoss.stop || lastClosePrice >= this.stopLoss.stop) return;
    
    await this.cancelAllOrders(exchangeService);
    this.stopLoss.status = OrderStatus.Open;
    await this.stopLoss.transmitToExchange(exchangeService, { remainingQuantity: this.remaining });
  }

  async closeTrade(exchangeService: ExchangeService): Promise<void> {
    if (this.close) throw new Error('Close order should not exist yet.');
    await this.cancelAllOrders(exchangeService);
    this.close = new MarketOrder(this.open.symbol, OrderSide.Sell, this.remaining);
    await this.close.transmitToExchange(exchangeService);
  }

  /* Cancel all open and waiting orders
   */
  private cancelAllOrders = async (exchangeService: ExchangeService): Promise<void> => {
    const toBeCanceledOrders = this.orders
      .filter(order => order.status === OrderStatus.Waiting || order.status === OrderStatus.Open);

    for (const order of toBeCanceledOrders) {
      await order.cancel(exchangeService);
    }
  }
}