import firebase from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { ConfigurationManager } from './config/configuration-manager';
import ExchangeId from './enums/exchange-id';
import ExchangeService from './infrastructure/exchange-service/exchange.service';
import ReadOnlyExchangeService from './infrastructure/exchange-service/read-only-exchange.service';
import TradeFirebaseRepository from './infrastructure/repositories/trade.firebase-repository';
import TradeInMemoryRepository from './infrastructure/repositories/trade.in-memory-repository';
import TradeRepository from './infrastructure/repositories/trade.repository';
import OrderService from './services/order.service';
import StopLossService from './services/stop-loss.service';
import TradeService from './services/trade.service';

export default class Workspace {
  private static _readOnlyExchange = false;
  private static _inMemoryDatabase = false;
  private static _exchanges = new Map<ExchangeId, ExchangeService>();
  private static _tradeService: TradeService | null = null;
  private static firestore: FirebaseFirestore.Firestore;
  private static _tradeRepository: TradeRepository | null = null;

  static init(readOnlyExchange: boolean = false, inMemoryDatabase: boolean = false) {
    this._readOnlyExchange = readOnlyExchange;
    this._inMemoryDatabase = inMemoryDatabase;

    if (!this._inMemoryDatabase) {
      this.initFirestore();
    }
  }

  static getExchange(exchangeId: ExchangeId): ExchangeService {
    let exchange = this._exchanges.get(exchangeId);
    if (!exchange) {
      exchange = this._readOnlyExchange ? new ReadOnlyExchangeService(exchangeId) : new ExchangeService(exchangeId);
      this._exchanges.set(exchangeId, exchange);
    }
    return exchange;
  }

  static get tradeService(): TradeService {
    if (!this._tradeService) {
      const orderService = new OrderService();
      const stopLossService = new StopLossService(orderService);
      this._tradeService = new TradeService(orderService, stopLossService, this.tradeRepository);
    }
    return this._tradeService;
  }

  private static initFirestore() {
    firebase.initializeApp({
      credential: firebase.credential.cert(ConfigurationManager.getFirebaseServiceAccount()),
    });
    this.firestore = getFirestore();
    this.firestore.settings({ ignoreUndefinedProperties: true });
  }

  private static get tradeRepository(): TradeRepository {
    if (!this._tradeRepository) this._tradeRepository = this._inMemoryDatabase ? new TradeInMemoryRepository() : new TradeFirebaseRepository(this.firestore);
    return this._tradeRepository;
  }
}