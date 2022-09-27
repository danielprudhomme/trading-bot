import Indicator from '../indicator';
import { IndicatorSource } from '../indicator-source';
import IndicatorValue from '../indicator-value';
import SMA from '../moving-average/sma';

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

  protected calculateAtIndex(index: number): IndicatorValue | null {
    const up = this.chart.getIndicatorValueAtIndex(index, this.upRMA)?.value;
    const down = this.chart.getIndicatorValueAtIndex(index, this.downRMA)?.value;

    if (!up || !down) return null;

    const rsi = down == 0 ? 100 : up == 0 ? 0 : 100 - (100 / (1 + up / down));
    return new IndicatorValue(rsi);
  }
}

class Up extends Indicator {
  protected calculateAtIndex(index: number): IndicatorValue | null {
    const candlestick = this.chart.getCandlestickAtIndex(index);
    const previousCandlestick = this.chart.getCandlestickAtIndex(index - 1);
    const value = candlestick && previousCandlestick ? Math.max(candlestick.close - previousCandlestick.close, 0) : 0;
    return new IndicatorValue(value);
  }
}

class Down extends Indicator {
  protected calculateAtIndex(index: number): IndicatorValue | null {
    const candlestick = this.chart.getCandlestickAtIndex(index);
    const previousCandlestick = this.chart.getCandlestickAtIndex(index - 1);
    const value = candlestick && previousCandlestick ? -Math.min(candlestick.close - previousCandlestick.close, 0) : 0;
    return new IndicatorValue(value);
  }
}

class RMA extends Indicator {
  length: number;
  sma: SMA;

  constructor(length: number, source: IndicatorSource, sma: SMA) {
    super(source);
    this.length = length;
    this.sma = sma;
  }

  protected calculateAtIndex(index: number): IndicatorValue | null {
    if (index < this.length - 1) return null;

    const alpha = 1 / this.length;

    const candlestick = this.chart.getCandlestickAtIndex(index);
    const lastCandlestickRMA = this.chart.getIndicatorValueAtIndex(index - 1, this)?.value ?? 0;

    const value = lastCandlestickRMA === null ?
      candlestick?.getIndicatorValue(this.sma)?.value ?? 0 : 
      alpha * this.source(index) + (1 - alpha) * lastCandlestickRMA;
    
    return new IndicatorValue(value);
  }
}
