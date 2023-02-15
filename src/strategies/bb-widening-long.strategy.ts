import TickerHelper from '../helpers/ticker.helper';
import { bb } from '../indicators/bollinger-bands/bollinger-bands';
import { sma } from '../indicators/moving-average/sma';
import { rsi } from '../indicators/rsi/rsi';
import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';
import Strategy from './strategy';
import { StrategyType } from './strategy-type';

export default interface BBWideningLongStrategy extends Strategy {
  bbMinWidth: number;
  tp: number;
}

const type: StrategyType = 'bb-widening-long';
export const bbWideningLongStrategy = (
  ticker: Ticker,
  timeframe: TimeFrame,
  bbLength: number,
  bbMult: number,
  bbMinWidth: number,
  smaLength: number,
  tp: number,
): BBWideningLongStrategy => ({
  id: `${type}::${TickerHelper.toString(ticker)}::${timeframe}`,
  type,
  ticker,
  currentTradeId: null,
  indicators: [
    { indicator: bb(bbLength, bbMult), timeframe },
    { indicator: sma(smaLength), timeframe },
    { indicator: rsi(14), timeframe },
  ],
  bbMinWidth,
  tp,
});