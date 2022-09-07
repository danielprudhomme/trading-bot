import Indicator from './indicator';
import { IndicatorSource } from './indicator-source';
import IndicatorValue from './indicator-value';
import SMA from './sma';

/* Relative Strength Index */
export default class RSI extends Indicator {
  private length: number;
  
  private upIndicator : Up;
  private downIndicator : Down;
  private upSMA : SMA;
  private downSMA : SMA;
  private upRMA : RMA;
  private downRMA : RMA;
  
  constructor(length: number = 14) {
    super();
    this.length = length;
    
    this.upIndicator = new Up();
    this.addDependency(this.upIndicator);
    this.downIndicator = new Down();
    this.addDependency(this.downIndicator);
    this.upSMA = new SMA(this.length, (index: number) => this.chart.getIndicatorValueAtIndex(index, this.upIndicator)?.value ?? 0);
    this.addDependency(this.upSMA);
    this.downSMA = new SMA(this.length, (index: number) => this.chart.getIndicatorValueAtIndex(index, this.downIndicator)?.value ?? 0);
    this.addDependency(this.downSMA);
    this.upRMA = new RMA(this.length, (index: number) => this.chart.getIndicatorValueAtIndex(index, this.upIndicator)?.value ?? 0, this.upSMA);
    this.addDependency(this.upRMA);
    this.downRMA = new RMA(this.length, (index: number) => this.chart.getIndicatorValueAtIndex(index, this.downIndicator)?.value ?? 0, this.downSMA);
    this.addDependency(this.downRMA);
  }

  calculateAtIndex(index: number) {
    const up = this.chart.getIndicatorValueAtIndex(index, this.upRMA)?.value;
    const down = this.chart.getIndicatorValueAtIndex(index, this.downRMA)?.value;

    if (up && down) {
      const rsi = down == 0 ? 100 : up == 0 ? 0 : 100 - (100 / (1 + up / down));
      this.chart.setIndicatorValueAtIndex(index, this, new IndicatorValue(rsi));
    }
  }
}

class Up extends Indicator {
  calculateAtIndex(index: number): void {
    const candle = this.chart.getCandleAtIndex(index);
    const value = index === 0 ? 0 : Math.max(candle.close - this.chart.getCandleAtIndex(index - 1).close, 0);
    candle.setIndicatorValue(this, new IndicatorValue(value));
  }
}

class Down extends Indicator {
  calculateAtIndex(index: number): void {
    const candle = this.chart.getCandleAtIndex(index);
    const value = index === 0 ? 0 : -Math.min(candle.close - this.chart.getCandleAtIndex(index - 1).close, 0);
    candle.setIndicatorValue(this, new IndicatorValue(value));
  }
}

class RMA extends SMA {
  sma: SMA;

  constructor(length: number, source: IndicatorSource, sma: SMA) {
    super(length, source);
    this.sma = sma;
  }

  calculateAtIndex(index: number) {
    if (index < this.length - 1) return;

    const alpha = 1 / this.length;

    const candle = this.chart.getCandleAtIndex(index);
    const lastCandleRMA = this.chart.getIndicatorValueAtIndex(index - 1, this)?.value ?? 0;

    const value = lastCandleRMA === null ?
      candle.getIndicatorValue(this.sma)?.value ?? 0 : 
      alpha * this.source(index) + (1 - alpha) * lastCandleRMA;
    
    candle.setIndicatorValue(this, new IndicatorValue(value));
  }
}
