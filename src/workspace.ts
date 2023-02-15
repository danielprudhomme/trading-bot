import firebase from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { ConfigurationManager } from './config/configuration-manager';
import { ExchangeId } from './enums/exchange-id';
import TickerHelper from './helpers/ticker.helper';
import ExchangeService from './infrastructure/exchange-service/exchange.service';
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
  private static _backtest = false;
  private static _inMemoryDatabase = false;

  private static _exchanges = new Map<ExchangeId, ExchangeService>();
  private static _charts = new Map<string, Map<TimeFrame, Chart>>();
  
  private static _tradeService: TradeService | null = null;
  private static _strategyService: StrategyService | null = null;
  private static _chartService: ChartService | null = null;
  
  private static _firestore: FirebaseFirestore.Firestore;
  private static _tradeRepository: TradeRepository | null = null;
  private static _strategyRepository: StrategyRepository | null = null;
  private static _chartRepository: ChartRepository | null = null;

  static init(backtest: boolean = false, inMemoryDatabase: boolean = false) {
    this._backtest = backtest;
    this._inMemoryDatabase = inMemoryDatabase;

    if (!this._inMemoryDatabase) {
      this.initFirestore();
    }
  }

  static setExchange(exchangeId: ExchangeId, exchange: ExchangeService): void {
    this._exchanges.set(exchangeId, exchange);
  }

  static getExchange(exchangeId: ExchangeId): ExchangeService {
    let exchange = this._exchanges.get(exchangeId);
    if (!exchange) {
      if (this._backtest) throw new Error('Exchange should have been set for backtest.');
      exchange = new ExchangeService(exchangeId);
      this._exchanges.set(exchangeId, exchange);
    }
    return exchange;
  }

  static addCharts(charts: Chart[]): void {
    charts.forEach(chart => this.addChart(chart.ticker, chart.timeframe, chart));
  }

  static getCharts = (): Map<string, Map<TimeFrame, Chart>> => this._charts;

  static getChart(ticker: Ticker, timeframe?: TimeFrame): Chart | undefined {
    const chartsByTimeframe = this._charts.get(TickerHelper.toString(ticker));
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
    let chartsByTimeframe = this._charts.get(TickerHelper.toString(ticker));
    if (!chartsByTimeframe) chartsByTimeframe = new Map<TimeFrame, Chart>();
    chartsByTimeframe.set(timeframe, chart);
    this._charts.set(TickerHelper.toString(ticker), chartsByTimeframe);
  }

  private static initFirestore() {
    firebase.initializeApp({
      credential: firebase.credential.cert(ConfigurationManager.getFirebaseServiceAccount()),
    });
    this._firestore = getFirestore();
    this._firestore.settings({ ignoreUndefinedProperties: true });
  }

  private static get chartRepository(): ChartRepository {
    if (!this._chartRepository) this._chartRepository = new ChartInMemoryRepository();
    return this._chartRepository;
  }

  static get strategyRepository(): StrategyRepository {
    if (!this._strategyRepository) this._strategyRepository = new StrategyInMemoryRepository();
    return this._strategyRepository;
  }

  static get tradeRepository(): TradeRepository {
    if (!this._tradeRepository) this._tradeRepository = this._inMemoryDatabase ? new TradeInMemoryRepository() : new TradeFirebaseRepository(this._firestore);
    return this._tradeRepository;
  }
}