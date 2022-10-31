import TimeFrame from '../enums/timeframe';
import ChartWorkspace from '../models/chart-workspace';
import Ticker from '../models/ticker';
import TradeManager from '../trade-manager';

export default abstract class Strategy {
  ticker: Ticker;
  timeframes: TimeFrame[];

  constructor(ticker: Ticker, timeframes: TimeFrame[]) {
    this.ticker = ticker;
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

  abstract execute(): Promise<void>;
}