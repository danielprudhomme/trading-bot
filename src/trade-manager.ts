import ExchangeService from './exchange-service/exchange.service';
import Trade from './models/trade';

export default class TradeManager {
  exchangeService: ExchangeService;
  trades: Trade[] = [];

  constructor(exchangeService: ExchangeService) {
    this.exchangeService = exchangeService;
  }

  add = async (trade: Trade): Promise<void> => {
    this.trades.push(trade);
  }

  close = async (trade: Trade): Promise<void> => {
    trade.closeTrade(this.exchangeService);
  }

  synchronizeAllWithExchange = async (currentPrice: number): Promise<void> => {
    for (const trade of this.trades.filter(x => x.isOpen)) {
      await trade.synchronizeWithExchange(currentPrice, this.exchangeService);
    }
  }
}
