import Indicator, { IndicatorSource } from '../indicator';
import Dema, { dema } from './dema';

export default interface MacdZeroLag extends Indicator {
  fastLength: number;
  slowLength: number;
  signalLength: number;
  fastDema: Dema;
  slowDema: Dema;
  signal: Dema;
}

export const macdZeroLag = (fastLength: number, slowLength: number, signalLength: number, source?: IndicatorSource): MacdZeroLag => ({
  type: 'macd-zero-lag',
  source: source ?? 'close',
  fastLength,
  slowLength,
  signalLength,
  fastDema: dema(fastLength, source),
  slowDema: dema(slowLength, source),
  signal: dema(signalLength, source),
});