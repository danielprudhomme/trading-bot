import Chart from '../../models/chart';
import { Direction } from '../direction';
import Indicator from '../indicator';
import { IndicatorService } from '../indicator.service';
import { Supertrend } from './supertrend';
import SupertrendValue from './supertrend-value';

/* Supertrend */
export default class SupertrendService extends IndicatorService {
  parameters: Supertrend;

  constructor(supertrend: Supertrend) {
    super(supertrend);
    this.parameters = supertrend;
  }

  getDependencies = (): Indicator[] => [this.parameters.atr];
  
  calculate(chart: Chart, index: number): void {
    const candlestick = chart.candlesticks[index];
    const prevCandlestick = chart.candlesticks[index + 1];
    
    const hl2 = (candlestick.high + candlestick.low) / 2;
    const atr = this.getIndicatorValue(chart, index, this.parameters.atr)?.value ?? 0;

    let lowerBand = hl2 - this.parameters.factor * atr;
    let upperBand = hl2 + this.parameters.factor * atr;

    const prevValue = this.getIndicatorValue(chart, index + 1) as SupertrendValue;
    const prevLowerBand = prevValue?.lowerBand ?? 0;
    const prevUpperBand = prevValue?.upperBand ?? 0;
    const prevDirection: Direction = prevValue?.direction ?? null;
    const prevClose = prevCandlestick?.close ?? 0;
    const prevAtr = this.getIndicatorValue(chart, index + 1);
    
    if (prevValue) {
      lowerBand = lowerBand > prevLowerBand || prevClose < prevLowerBand ? lowerBand : prevLowerBand;
      upperBand = upperBand < prevUpperBand || prevClose > prevUpperBand ? upperBand : prevUpperBand;
    }
    
    let direction: Direction = null;
    if (!prevAtr) direction = 'down';
    else if (prevDirection === 'down') direction = candlestick.close > upperBand ? 'up' : 'down';
    else direction = candlestick.close < lowerBand ? 'down' : 'up';
    
    const superTrend = direction === 'up' ? lowerBand : upperBand;
    
    this.setValue(chart, index, new SupertrendValue(superTrend, direction, upperBand, lowerBand));
  }
}
