import TimeFrame from '../enums/timeframe';
import ExchangeService from '../exchange-service/exchange.service';
import Candle from '../models/candle';
import ChartWorkspace from '../models/chart-workspace';
import Strategy from '../strategies/strategy';
import TradeManager from '../trade-manager';

export default abstract class TradingWorker {
  protected tickTimeFrame: TimeFrame;
  protected strategy: Strategy;

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

  protected _chartWorkspace: ChartWorkspace | null = null;
  protected get chartWorkspace(): ChartWorkspace {
    if (!this._chartWorkspace) throw new Error('ChartWorkspace should not be null.');
    return this._chartWorkspace;
  }

  constructor(tickTimeFrame: TimeFrame, strategy: Strategy) {
    this.tickTimeFrame = tickTimeFrame;
    this.strategy = strategy;
  }

  async init(): Promise<void> {
    this._exchangeService = this.initExchangeService();
    this._tradeManager = this.initTradeManager();
    this._chartWorkspace = await this.initChartWorkspace(this.strategy.timeframes);
    this.strategy.init(this.chartWorkspace, this.tradeManager);
  }

  protected abstract initExchangeService(): ExchangeService;
  protected abstract initTradeManager(): TradeManager;
  protected abstract initChartWorkspace(timeframes: TimeFrame[]): Promise<ChartWorkspace>;

  async launch(): Promise<void> {
    // CRON qui appelle onTick toutes les x secondes
    // override si backtest
  }

  async onTick() {
    const lastCandle = await this.fetchLastCandle();
    this.chartWorkspace.newCandle(lastCandle);
 
    // update trade manager with orders
    await this.tradeManager.syncAll(lastCandle);

    // execute strategy
    await this.strategy.execute();
  }

  protected abstract fetchLastCandle(): Promise<Candle>;
}