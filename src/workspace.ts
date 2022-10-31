import ExchangeId from './enums/exchange-id';
import ExchangeService from './exchange-service/exchange.service';
import ReadOnlyExchangeService from './exchange-service/read-only-exchange.service';
import { default as TradeInMemoryRepository, default as TradeRepository } from './repositories/trade-in-memory-repository';

export default class Workspace {
  public static readOnly = false;
  private static _exchanges = new Map<ExchangeId, ExchangeService>();
  private static _tradeRepository: TradeRepository | null = null;

  static getExchange(exchangeId: ExchangeId): ExchangeService {
    let exchange = this._exchanges.get(exchangeId);
    if (!exchange) {
      exchange = !this.readOnly ? new ExchangeService(exchangeId) : new ReadOnlyExchangeService(exchangeId);
      this._exchanges.set(exchangeId, exchange);
    }
    return exchange;
  }

  static getTradeRepository(): TradeRepository {
    if (!this._tradeRepository) this._tradeRepository = new TradeInMemoryRepository();
    return this._tradeRepository;
  }
}