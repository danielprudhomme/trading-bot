import TimeFrame from '../enums/timeframe';
import ChartWorkspace from '../models/chart-workspace';
import Ticker from '../models/ticker';
import Trade from '../models/trade';

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

  init(chartWorkspace: ChartWorkspace) {
    this._chartWorkspace = chartWorkspace;
    this.addIndicators();
  }
  
  abstract addIndicators(): void;

  abstract execute(trades: Trade[]): Promise<void>;
}