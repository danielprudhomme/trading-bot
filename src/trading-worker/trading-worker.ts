import TimeFrame from '../enums/timeframe';
import ExchangeService from '../exchange-service/exchange.service';
import Candle from '../models/candle';
import Chart from '../models/chart';
import Strategy from '../strategies/strategy';
import TradeManager from '../trade-manager';

export default abstract class TradingWorker {
  protected chartTimeFrame: TimeFrame;
  protected tickTimeFrame: TimeFrame;

  protected _exchangeService: ExchangeService | null = null;
  protected get exchangeService(): ExchangeService {
    if (!this._exchangeService) throw new Error('ExchangeService should not be null.');
    return this._exchangeService;
  }

  protected _tradeManager: TradeManager | null = null;
  protected get tradeManager(): TradeManager {
    if (!this._tradeManager) throw new Error('TradeManager should not be null.');
    return this._tradeManager;
  }
  
  protected _chart: Chart | null = null;
  protected get chart(): Chart {
    if (!this._chart) throw new Error('Chart should not be null.');
    return this._chart;
  }

  protected _strategy: Strategy | null = null;
  protected get strategy(): Strategy {
    if (!this._strategy) throw new Error('Strategy should not be null.');
    return this._strategy;
  }

  constructor(chartTimeFrame: TimeFrame, tickTimeFrame: TimeFrame) {
    this.chartTimeFrame = chartTimeFrame;
    this.tickTimeFrame = tickTimeFrame;
  }

  async init(): Promise<void> {
    this._exchangeService = this.initExchangeService();
    this._chart = await this.initChart();
    this._tradeManager = this.initTradeManager();
    this._strategy = this.initStategy();
  }

  protected abstract initExchangeService(): ExchangeService;
  protected abstract initChart(): Promise<Chart>;
  protected abstract initTradeManager(): TradeManager;
  protected abstract initStategy(): Strategy;

  async launch(): Promise<void> {
    // CRON qui appelle onTick toutes les x secondes
    // override si backtest
  }

  async onTick() {
    const lastCandle = await this.fetchLastCandle();
    this.chart.newCandle(lastCandle);

    // update trade manager with orders
    await this.tradeManager.syncAll();

    // execute strategy
    await this.strategy.execute();
  }

  protected abstract fetchLastCandle(): Promise<Candle>;
}