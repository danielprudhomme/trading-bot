import TradeHelper from '../helpers/trade.helper';
import ExchangeOrder from '../models/exchange-order';
import Order from '../models/order';
import Trade from '../models/trade';
import Workspace from '../workspace/workspace';

export default class OrderService {

  async transmitToExchange(trade: Trade, order: Order): Promise<void> {
    const exchange = Workspace.getExchange(trade.ticker.exchangeId);
    if (order.quantity === 'remaining') order.quantity = TradeHelper.remainingQuantity(trade);

    let exchangeOrder: ExchangeOrder;
    switch (order.type) {
      case 'market':
      case 'stop':
        exchangeOrder = await exchange.createMarketOrder(trade.ticker, order.side, order.quantity);
        order.status = 'closed';
        break;
      case 'limit':
        if (!order.limit) throw new Error('order limit should have been defined.');
        exchangeOrder = await exchange.createLimitOrder(trade.ticker, order.side, order.limit, order.quantity);
        break;
      default:
        throw new Error('Order type not implemented.');
    }
    order.exchangeOrder = exchangeOrder;
  }

  /* Synchronize order with exchange (checks if closed in exchange) */
  async synchronizeWithExchange(trade: Trade, order: Order): Promise<void> {
    if (!order.exchangeOrder) return;

    const exchange = Workspace.getExchange(trade.ticker.exchangeId);

    const exchangeOrder = await exchange.fetchOrder(trade.ticker, order.exchangeOrder.id);
    if (!exchangeOrder) return;
    order.exchangeOrder = exchangeOrder;

    if (order.exchangeOrder.status !== 'closed') return;
    order.status = 'closed';
    trade.updated = true;
  }

  async cancel(trade: Trade, order: Order): Promise<void> {
    order.status = 'canceled';
    if (!order.exchangeOrder || order.exchangeOrder.status !== 'open') return;
    const exchange = Workspace.getExchange(trade.ticker.exchangeId);
    await exchange.cancelOrder(trade.ticker, order.exchangeOrder.id);
    order.exchangeOrder.status = 'canceled';
  }
}