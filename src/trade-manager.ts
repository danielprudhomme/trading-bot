import Trade from './models/trade';

export default class TradeManager {
  trades: Trade[] = [];

  add = async (trade: Trade): Promise<void> => {
    this.trades.push(trade);
  }

  close = async (trade: Trade): Promise<void> => {
    trade.closeTrade();
  }

  synchronizeAllWithExchange = async (currentPrice: number): Promise<void> => {
    for (const trade of this.trades.filter(x => x.isOpen)) {
      await trade.synchronizeWithExchange(currentPrice);
    }
  }
}
