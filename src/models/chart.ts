import ccxt from 'ccxt';
import TimeFrame from '../enums/timeframe';
import Indicator from '../indicators/indicator';
import Candle from './candle';

export default class Chart {
  timeframe: TimeFrame;
  candles: Candle[];

  constructor(timeframe: TimeFrame, ohlcv: ccxt.OHLCV[]) {
    this.timeframe = timeframe;
    this.candles = ohlcv.map(x => new Candle(x));
  }

  getCandleAtIndex = (index: number) => this.candles[index];

  hasIndicatorValueAtIndex = (index: number, indicator: Indicator): boolean =>
    this.getCandleAtIndex(index).hasIndicatorValue(indicator);

  getIndicatorValueAtIndex = (index: number, indicator: Indicator) =>
    this.getCandleAtIndex(index).getIndicatorValue(indicator);
    
  setIndicatorValueAtIndex = (index: number, indicator: Indicator, value: number) =>
    this.getCandleAtIndex(index).setIndicatorValue(indicator, value);

  getLastCandle = () => this.candles[this.candles.length - 1];

  // add data (tick par exemple) => calculer tous les indicateurs
  addData() {
    
  }
  
  addIndicator(indicator: Indicator) {
    indicator.bind(this);
    indicator.calculate();
  }
  
}
