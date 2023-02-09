import * as fs from 'fs';
import { getBacktestDataFile } from '../../backtest/backtest-data-file.helper';
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
    this.ohlcvs = this.getOhlcvs(this.start, this.end, this.timeframe);
  }

  fetchChartInit = async (ticker: Ticker, timeframe: TimeFrame): Promise<OHLCV[]> => {
    const start = this.start - TimeFrameHelper.toMilliseconds(timeframe) * CHART_CANDLESTICKS_COUNT;
    const end = this.start;
    return this.getOhlcvs(start, end, timeframe);
  }

  fetchOne = async (ticker: Ticker, timeframe: TimeFrame): Promise<OHLCV> => {
    const ohlcv = this.ohlcvs.shift();
    if (!ohlcv) throw new Error('No more Ohlcvs');
    return ohlcv;
  }

  private getOhlcvs(start: number, end: number, timeframe: TimeFrame): OHLCV[] {
    const startYear = new Date(start).getUTCFullYear();
    
    let endYear = new Date(end).getUTCFullYear();
    if (new Date(end - TimeFrameHelper.toMilliseconds(timeframe)).getUTCFullYear() === endYear - 1)
      endYear = endYear - 1;
    

    let ohlcvs: OHLCV[] = [];
    for (let year = startYear; year <= endYear; year++) {
      const filteredOhlcvs = this.getOhlcvsForYear(this.ticker, year, timeframe)
        .filter(ohlcv => ohlcv.timestamp >= start && ohlcv.timestamp <= end);
        ohlcvs = ohlcvs.concat(filteredOhlcvs);
    }

    return ohlcvs;
  }

  private getOhlcvsForYear(ticker: Ticker, year: number, timeframe: TimeFrame): OHLCV[] {
    const filePath = getBacktestDataFile(ticker, year, timeframe);
    const jsonString = fs.readFileSync(filePath, 'utf-8');
    const ohlcvs = JSON.parse(jsonString);
    return ohlcvs as OHLCV[];
  }
}