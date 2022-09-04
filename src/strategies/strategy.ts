import Chart from '../models/chart';
import TradeManager from '../trade-manager';

export default abstract class Strategy {
  protected chart: Chart;
  protected tradeManager: TradeManager;

  constructor(chart: Chart, tradeManager: TradeManager) {
    this.chart = chart;
    this.tradeManager = tradeManager;
  }
  
  abstract execute(): Promise<void>;
}