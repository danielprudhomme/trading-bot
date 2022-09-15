import TimeFrame from '../enums/timeframe';
import ChartWorkspace from '../models/chart-workspace';
import TradeManager from '../trade-manager';

export default abstract class Strategy {
  timeframes: TimeFrame[];

  constructor(timeframes: TimeFrame[]) {
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
  }
  
  abstract execute(): Promise<void>;
}