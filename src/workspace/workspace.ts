
import { ExchangeId } from '../enums/exchange-id';
import TickerHelper from '../helpers/ticker.helper';
import ExchangeService from '../infrastructure/exchange-service/exchange.service';
import Chart from '../models/chart';
import Ticker from '../models/ticker';
import ChartService from '../services/chart.service';
import OrderService from '../services/order.service';
import StopLossService from '../services/stop-loss.service';
import TradeService from '../services/trade.service';
import StrategyService from '../strategies/strategy.service';
import { TimeFrame } from '../timeframe/timeframe';
import TimeFrameHelper from '../timeframe/timeframe.helper';
import RepositoryProvider from './repository.provider';

export default class Workspace {
  private static _backtest = false;

  private static _exchanges = new Map<ExchangeId, ExchangeService>();
  private static _charts = new Map<string, Map<TimeFrame, Chart>>();
  
  private static _tradeService: TradeService | null = null;
  private static _strategyService: StrategyService | null = null;
  private static _chartService: ChartService | null = null;

  private static _repositoryProvider: RepositoryProvider | null = null;

  static init(backtest: boolean = false, inMemoryDatabase: boolean = false) {
    this._backtest = backtest;
    
    this._repositoryProvider = new RepositoryProvider(inMemoryDatabase);
  }

  static get repository(): RepositoryProvider {
    if (!this._repositoryProvider) throw new Error('Repository provider should be defined !');
    return this._repositoryProvider;
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
      this._tradeService = new TradeService(orderService, stopLossService, this.repository.trade);
    }
    return this._tradeService;
  }

  static get strategyService(): StrategyService {
    if (!this._strategyService) this._strategyService = new StrategyService(this.repository.strategy);
    return this._strategyService;
  }

  static get chartService(): ChartService {
    if (!this._chartService) this._chartService = new ChartService(this.repository.chart);
    return this._chartService;
  }

  private static addChart(ticker: Ticker, timeframe: TimeFrame, chart: Chart) {
    let chartsByTimeframe = this._charts.get(TickerHelper.toString(ticker));
    if (!chartsByTimeframe) chartsByTimeframe = new Map<TimeFrame, Chart>();
    chartsByTimeframe.set(timeframe, chart);
    this._charts.set(TickerHelper.toString(ticker), chartsByTimeframe);
  }
}