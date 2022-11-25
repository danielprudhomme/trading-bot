import firebase from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { ConfigurationManager } from './config/configuration-manager';
import ExchangeId from './enums/exchange-id';
import ExchangeService from './infrastructure/exchange-service/exchange.service';
import ReadOnlyExchangeService from './infrastructure/exchange-service/read-only-exchange.service';
import ChartInMemoryRepository from './infrastructure/repositories/chart.in-memory-repository';
import ChartRepository from './infrastructure/repositories/chart.repository';
import StrategyInMemoryRepository from './infrastructure/repositories/strategy.in-memory-repository';
import StrategyRepository from './infrastructure/repositories/strategy.repository';
import TradeFirebaseRepository from './infrastructure/repositories/trade.firebase-repository';
import TradeInMemoryRepository from './infrastructure/repositories/trade.in-memory-repository';
import TradeRepository from './infrastructure/repositories/trade.repository';
import Chart from './models/chart';
import Ticker from './models/ticker';
import ChartService from './services/chart.service';
import OrderService from './services/order.service';
import StopLossService from './services/stop-loss.service';
import TradeService from './services/trade.service';
import StrategyService from './strategies/strategy.service';
import { TimeFrame } from './timeframe/timeframe';
import TimeFrameHelper from './timeframe/timeframe.helper';

export default class Workspace {
  private static _readOnlyExchange = false;
  private static _inMemoryDatabase = false;

  private static _exchanges = new Map<ExchangeId, ExchangeService>();
  private static _charts = new Map<string, Map<TimeFrame, Chart>>();
  
  private static _tradeService: TradeService | null = null;
  private static _strategyService: StrategyService | null = null;
  private static _chartService: ChartService | null = null;
  
  private static firestore: FirebaseFirestore.Firestore;
  private static _tradeRepository: TradeRepository | null = null;
  private static _strategyRepository: StrategyRepository | null = null;
  private static _chartRepository: ChartRepository | null = null;

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

  static addCharts(charts: Chart[]): void {
    charts.forEach(chart => this.addChart(chart.ticker, chart.timeframe, chart));
  }

  static getCharts = (): Map<string, Map<TimeFrame, Chart>> => this._charts;

  static getChart(ticker: Ticker, timeframe?: TimeFrame): Chart | undefined {
    const chartsByTimeframe = this._charts.get(this.tickerToString(ticker));
    if (!chartsByTimeframe || chartsByTimeframe.size === 0) return undefined;

    if (!timeframe) {
      timeframe = Array.from(chartsByTimeframe.keys()).sort(TimeFrameHelper.compare)[0];
    }
    
    return chartsByTimeframe.get(timeframe);
  }

  static get tradeService(): TradeService {
    if (!this._tradeService) {
      const orderService = new OrderService();
      const stopLossService = new StopLossService(orderService);
      this._tradeService = new TradeService(orderService, stopLossService, this.tradeRepository);
    }
    return this._tradeService;
  }

  static get strategyService(): StrategyService {
    if (!this._strategyService) this._strategyService = new StrategyService(this.strategyRepository);
    return this._strategyService;
  }

  static get chartService(): ChartService {
    if (!this._chartService) this._chartService = new ChartService(this.chartRepository);
    return this._chartService;
  }

  private static addChart(ticker: Ticker, timeframe: TimeFrame, chart: Chart) {
    let chartsByTimeframe = this._charts.get(this.tickerToString(ticker));
    if (!chartsByTimeframe) chartsByTimeframe = new Map<TimeFrame, Chart>();
    chartsByTimeframe.set(timeframe, chart);
    this._charts.set(this.tickerToString(ticker), chartsByTimeframe);
  }

  private static initFirestore() {
    firebase.initializeApp({
      credential: firebase.credential.cert(ConfigurationManager.getFirebaseServiceAccount()),
    });
    this.firestore = getFirestore();
    this.firestore.settings({ ignoreUndefinedProperties: true });
  }

  private static get chartRepository(): ChartRepository {
    if (!this._chartRepository) this._chartRepository = new ChartInMemoryRepository();
    return this._chartRepository;
  }

  private static get strategyRepository(): StrategyRepository {
    if (!this._strategyRepository) this._strategyRepository = new StrategyInMemoryRepository();
    return this._strategyRepository;
  }

  private static get tradeRepository(): TradeRepository {
    if (!this._tradeRepository) this._tradeRepository = this._inMemoryDatabase ? new TradeInMemoryRepository() : new TradeFirebaseRepository(this.firestore);
    return this._tradeRepository;
  }

  private static tickerToString = (ticker: Ticker): string => `${ticker.exchangeId}/${ticker.asset}/${ticker.base}`;
}