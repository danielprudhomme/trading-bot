import TickerHelper from '../helpers/ticker.helper';
import { bb } from '../indicators/bollinger-bands/bollinger-bands';
import { sma } from '../indicators/moving-average/sma';
import { supertrend } from '../indicators/supertrend/supertrend';
import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';
import Strategy from './strategy';
import { StrategyType } from './strategy-type';

export default interface TrendSmaDailyStrategy extends Strategy {
  timeframe: TimeFrame,
}

const type: StrategyType = 'trend-sma-daily';
export const trendSmaDailyStrategy = (
  ticker: Ticker,
  initialBalance: number,
  timeframe: TimeFrame,
  smaDailyLength: number,
  bbParams: { length: number, mult: number },
  supertrendParams: { factor: number, atrPeriod: number },
): TrendSmaDailyStrategy => ({
  id: `${type}::${TickerHelper.toString(ticker)}::${timeframe}`,
  type,
  ticker,
  currentTradeId: null,
  availableBalance: initialBalance,
  indicators: [
    { indicator: sma(smaDailyLength), timeframe: '1d' },
    { indicator: bb(bbParams.length, bbParams.mult), timeframe: '1d' },
    { indicator: bb(bbParams.length, bbParams.mult), timeframe },
    { indicator: supertrend(supertrendParams.factor, supertrendParams.atrPeriod), timeframe },
  ],
  timeframe,
});