import Indicator from './indicator';
import { IndicatorSource } from './indicator-source';
import SMA from './sma';

/* Relative Strength Index */
export default class RSI extends Indicator {
  length: number;
  
  constructor(length: number = 14) {
    super();
    this.length = length;
  }

  private _upIndicator : Up | null = null;
  private _downIndicator : Up | null = null;
  private get upIndicator(): Up {
    if (this._upIndicator)
      return this._upIndicator;
    throw new Error('Up indicator should exists.');
  }
  private get downIndicator(): Up {
    if (this._downIndicator)
      return this._downIndicator;
    throw new Error('Down indicator should exists.');
  }

  private _upSMA : SMA | null = null;
  private _downSMA : SMA | null = null;
  private get upSMA(): SMA {
    if (this._upSMA)
      return this._upSMA;
    throw new Error('Up SMA should exists.');
  }
  private get downSMA(): SMA {
    if (this._downSMA)
      return this._downSMA;
    throw new Error('Down SMA should exists.');
  }

  private _upRMA : RMA | null = null;
  private _downRMA : RMA | null = null;
  private get upRMA(): RMA {
    if (this._upRMA)
      return this._upRMA;
    throw new Error('Up RMA should exists.');
  }
  private get downRMA(): RMA {
    if (this._downRMA)
      return this._downRMA;
    throw new Error('Down SMA should exists.');
  }

  calculate(): void {
    this._upIndicator = new Up();
    this._downIndicator = new Down();
    this.chart.addIndicator(this.upIndicator);
    this.chart.addIndicator(this.downIndicator);

    this._upSMA = new SMA(this.length, (index: number) => this.chart.getIndicatorValueAtIndex(index, this.upIndicator) ?? 0);
    this._downSMA = new SMA(this.length, (index: number) => this.chart.getIndicatorValueAtIndex(index, this.downIndicator) ?? 0);
    this.chart.addIndicator(this.upSMA);
    this.chart.addIndicator(this.downSMA);

    this._upRMA = new RMA(this.length, (index: number) => this.chart.getIndicatorValueAtIndex(index, this.upIndicator) ?? 0, this.upSMA);
    this._downRMA = new RMA(this.length, (index: number) => this.chart.getIndicatorValueAtIndex(index, this.downIndicator) ?? 0, this.downSMA);
    this.chart.addIndicator(this.upRMA);
    this.chart.addIndicator(this.downRMA);

    super.calculate();
  }

  calculateAtIndex(index: number) {
    const up = this.chart.getIndicatorValueAtIndex(index, this.upRMA);
    const down = this.chart.getIndicatorValueAtIndex(index, this.downRMA);

    if (up !== null && down !== null) {
      const rsi = down == 0 ? 100 : up == 0 ? 0 : 100 - (100 / (1 + up / down));
      this.chart.setIndicatorValueAtIndex(index, this, rsi);
    }
  }
}

class Up extends Indicator {
  calculateAtIndex(index: number): void {
    const candle = this.chart.getCandleAtIndex(index);
    const value = index === 0 ? 0 : Math.max(candle.close - this.chart.getCandleAtIndex(index - 1).close, 0);
    candle.setIndicatorValue(this, value);
  }
}

class Down extends Indicator {
  calculateAtIndex(index: number): void {
    const candle = this.chart.getCandleAtIndex(index);
    const value = index === 0 ? 0 : -Math.min(candle.close - this.chart.getCandleAtIndex(index - 1).close, 0);
    candle.setIndicatorValue(this, value);
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
    const lastCandleRMA = this.chart.getIndicatorValueAtIndex(index - 1, this);

    const value = lastCandleRMA === null ? 
      candle.getIndicatorValue(this.sma) ?? 0 : 
      alpha * this.source(index) + (1 - alpha) * lastCandleRMA;
    
    candle.setIndicatorValue(this, value);
  }
}
