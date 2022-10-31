import ExchangeId from './enums/exchange-id';
import ExchangeService from './exchange-service/exchange.service';
import ReadOnlyExchangeService from './exchange-service/read-only-exchange.service';

export default class Workspace {
  public static readOnly = false;
  private static _exchanges = new Map<ExchangeId, ExchangeService>();

  static getExchange(exchangeId: ExchangeId): ExchangeService {
    let exchange = this._exchanges.get(exchangeId);
    if (!exchange) {
      exchange = !this.readOnly ? new ExchangeService(exchangeId) : new ReadOnlyExchangeService(exchangeId);
      this._exchanges.set(exchangeId, exchange);
    }
    return exchange;
  }

  
}