
import { ExchangeId } from '../enums/exchange-id';
import TickerHelper from '../helpers/ticker.helper';
import ExchangeService from '../infrastructure/exchange-service/exchange.service';
import Chart from '../models/chart';
import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';
import TimeFrameHelper from '../timeframe/timeframe.helper';
import DataStore from './data.store';
import RepositoryProvider from './repository.provider';
import ServiceProvider from './service.provider';

export default class Workspace {
  private static _backtest = false;
  private static _exchanges = new Map<ExchangeId, ExchangeService>();
  private static _charts = new Map<string, Map<TimeFrame, Chart>>();
  private static _repositoryProvider: RepositoryProvider | null = null;
  private static _serviceProvider: ServiceProvider | null = null;
  private static _dataStore: DataStore | null = null;

  static init(backtest: boolean = false, inMemoryDatabase: boolean = false) {
    this._backtest = backtest;
    this._repositoryProvider = new RepositoryProvider(inMemoryDatabase);
    this._serviceProvider = new ServiceProvider(this._repositoryProvider);
    this._dataStore = new DataStore();
  }

  static get repository(): RepositoryProvider {
    if (!this._repositoryProvider) throw new Error('Repository provider should be defined !');
    return this._repositoryProvider;
  }

  static get service(): ServiceProvider {
    if (!this._serviceProvider) throw new Error('Service provider should be defined !');
    return this._serviceProvider;
  }

  static get store(): DataStore {
    if (!this._dataStore) throw new Error('Data store should be defined !');
    return this._dataStore;
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

  static setCharts(charts: Chart[]): void {
    charts.forEach(chart => this.setChart(chart.ticker, chart.timeframe, chart));
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

  private static setChart(ticker: Ticker, timeframe: TimeFrame, chart: Chart) {
    let chartsByTimeframe = this._charts.get(TickerHelper.toString(ticker));
    if (!chartsByTimeframe) chartsByTimeframe = new Map<TimeFrame, Chart>();
    chartsByTimeframe.set(timeframe, chart);
    this._charts.set(TickerHelper.toString(ticker), chartsByTimeframe);
  }
}