import TimeFrame from '../enums/timeframe';
import MacdZeroLag from '../indicators/macd-zero-lag/macd-zero-lag';
import SMA from '../indicators/moving-average/sma';
import Strategy from './strategy';

export default class OptiStrategy extends Strategy {
  private sma20 = new SMA(20);
  private macdZeroLag = new MacdZeroLag();

  constructor() {
    super([TimeFrame.t5m, TimeFrame.t15m, TimeFrame.t1h]);
  }

  addIndicators(): void {
    for (const timeframe of this.timeframes) {
      this.chartWorkspace.get(timeframe)?.addIndicator(this.sma20);
      this.chartWorkspace.get(timeframe)?.addIndicator(this.macdZeroLag);
    }
  }

  execute(): Promise<void> {
    for (const timeframe of this.timeframes) {
      const chart = this.chartWorkspace.get(timeframe);
      const sma20 = chart?.currentCandlestick.getIndicatorValue(this.sma20);
      const macdZeroLag = chart?.currentCandlestick.getIndicatorValue(this.macdZeroLag);

      sma20?.value
    }
  }
}