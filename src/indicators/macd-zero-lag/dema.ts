import Indicator, { IndicatorSource } from '../indicator';
import { ema, Ema } from '../moving-average/ema';

export default interface Dema extends Indicator {
  length: number;
  ema: Ema;
  emaEma: Ema;
}

export const dema = (length: number, source?: IndicatorSource): Dema => {
  const emaParam = ema(length, source);

  return {
    type: 'dema',
    source: source ?? 'close',
    length,
    ema: emaParam,
    emaEma: ema(length, emaParam),
  };
}