import TimeFrame from '../enums/timeframe';
import ExchangeService from '../exchange-service/exchange.service';
import ChartWorkspace from '../models/chart-workspace';
import { Symbol } from '../models/symbol';
import TradeManager from '../trade-manager';

export default abstract class Strategy {
  symbol: Symbol;
  timeframes: TimeFrame[];

  constructor(symbol: Symbol, timeframes: TimeFrame[]) {
    this.symbol = symbol;
    this.timeframes = timeframes;
  }

  private _chartWorkspace: ChartWorkspace | null = null;
  protected get chartWorkspace(): ChartWorkspace {
    if (!this._chartWorkspace) throw new Error('Chart should be defined. Use method init before everything else.');
    return this._chartWorkspace;
  }
  
  private _tradeManager: TradeManager | null = null;
  protected get tradeManager(): TradeManager {
    if (!this._tradeManager) throw new Error('TradeManager should be defined. Use method init before everything else.');
    return this._tradeManager;
  }

  init(chartWorkspace: ChartWorkspace, tradeManager: TradeManager) {
    this._chartWorkspace = chartWorkspace;
    this._tradeManager = tradeManager;
    this.addIndicators();
  }
  
  abstract addIndicators(): void;

  abstract execute(exchangeService: ExchangeService): Promise<void>;
}