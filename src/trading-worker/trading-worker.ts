import TimeFrame from '../enums/timeframe';
import ExchangeService from '../exchange-service/exchange.service';
import Candlestick from '../models/candlestick';
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
    console.log('Trading worker - init');
    this._exchangeService = this.initExchangeService();
    this._tradeManager = this.initTradeManager();
    console.log('Trading worker - chart workspace init start !');
    this._chartWorkspace = await this.initChartWorkspace(this.strategy.timeframes);
    console.log('Trading worker - chart workspace init done !');
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
    const lastCandlestick = await this.fetchLastCandlestick();
    this.chartWorkspace.newCandlestick(lastCandlestick);
 
    // update trade manager with orders
    await this.tradeManager.syncAll(lastCandlestick);

    // execute strategy
    await this.strategy.execute();
  }

  protected abstract fetchLastCandlestick(): Promise<Candlestick>;
}