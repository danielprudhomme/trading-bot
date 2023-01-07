import { CHART_CANDLESTICKS_COUNT } from '../../config/constants';
import { OHLCV } from '../../models/ohlcv';
import Ticker from '../../models/ticker';
import { TimeFrame } from '../../timeframe/timeframe';
import TimeFrameHelper from '../../timeframe/timeframe.helper';
import ReadOnlyExchangeService from './read-only-exchange.service';

export default class BacktestExchangeService extends ReadOnlyExchangeService {
  ticker: Ticker;
  timeframe: TimeFrame;
  ohlcvs: OHLCV[] = [];
  start: number;
  end: number;

  constructor(ticker: Ticker, timeframe: TimeFrame, start: number, end: number) {
    super(ticker.exchangeId);
    this.ticker = ticker;
    this.timeframe = timeframe;
    this.start = start;
    this.end = end;
  }

  async init(): Promise<void> {
    this.ohlcvs = await this.fetchRange(this.ticker, this.timeframe, this.start, this.end);
  }

  fetchChartInit = async (ticker: Ticker, timeframe: TimeFrame): Promise<OHLCV[]> => {
    const startChart = this.start - TimeFrameHelper.toMilliseconds(timeframe) * CHART_CANDLESTICKS_COUNT;
    return await this.fetchOHLCV(ticker, timeframe, startChart, CHART_CANDLESTICKS_COUNT);
  }

  fetchOne = async (ticker: Ticker, timeframe: TimeFrame): Promise<OHLCV> => {
    const ohlcv = this.ohlcvs.shift();
    if (!ohlcv) throw new Error('No more Ohlcvs');
    return ohlcv;
  }
}