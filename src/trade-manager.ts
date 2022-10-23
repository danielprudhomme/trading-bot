import ExchangeService from './exchange-service/exchange.service';
import Candlestick from './models/candlestick';
import Trade from './models/trade';
import PerformanceCalculator from './performance-calculator';

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

  synchronizeAllWithExchange = async (currentCandlestick: Candlestick): Promise<void> => {
    for (const trade of this.trades.filter(x => x.isOpen)) {
      await trade.synchronizeWithExchange(currentCandlestick, this.exchangeService);
    }
  }

  getPerformance = (): void => {
    // somme des perfs de chaque trade, pas d'intérets composés ici
    const sumPerf = this.trades.reduce((sum, trade, i) => {
      const perf = PerformanceCalculator.getTradePerformance(trade);
      console.log('perf ' + i, perf);
      return sum + (perf ?? 0);
    }, 0);
    console.log('perf globale : ', sumPerf);
  }
}
