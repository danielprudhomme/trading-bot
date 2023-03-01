import { Guid } from 'guid-typescript';
import { CHART_CANDLESTICKS_COUNT } from '../config/constants';
import TickerHelper from '../helpers/ticker.helper';
import Indicator from '../indicators/indicator';
import IndicatorOnChart from '../indicators/indicator-on-chart';
import IndicatorServiceProvider from '../indicators/indicator-service-provider';
import IndicatorHelper from '../indicators/indicator.helper';
import ChartRepository from '../infrastructure/repositories/chart/chart.repository';
import Candlestick from '../models/candlestick';
import Chart from '../models/chart';
import { OHLCV } from '../models/ohlcv';
import Ticker from '../models/ticker';
import { TimeFrame } from '../timeframe/timeframe';
import TimeFrameHelper from '../timeframe/timeframe.helper';
import Workspace from '../workspace/workspace';

export default class ChartService {
  private chartRepository: ChartRepository;

  constructor(
    chartRepository: ChartRepository,
  ) {
    this.chartRepository = chartRepository;
  }

  async fetchAndUpdate(indicators: IndicatorOnChart[], tickTimeframe: TimeFrame) {
    // Get all charts
    const charts = await this.chartRepository.getAll();

    // Add indicators to charts
    for (const { timeframe, indicator, ticker } of indicators) {
      let chart = charts.find(c => c.timeframe === timeframe && TickerHelper.toString(c.ticker) === TickerHelper.toString(ticker));
      if (!chart) {
        chart = await this.createChart(timeframe, ticker);
        charts.push(chart);
      }

      this.addIndicator(chart, indicator);
    }

    // Group charts by ticker, to do only fetch data once per ticker
    const chartsByTicker = charts.reduce((map, chart) => {
      const tickerStr = TickerHelper.toString(chart.ticker);
      const c: Chart[] = map.get(tickerStr) ?? [];
      c.push(chart);
      return map.set(tickerStr, c);
    }, new Map<string, Chart[]>());

    for (const charts of Array.from(chartsByTicker.values())) {
      const ticker = charts[0].ticker;
      const ohlcv = await Workspace.getExchange(ticker.exchangeId).fetchOne(ticker, tickTimeframe);
      charts.forEach(chart => this.addOrUpdateCandlestick(chart, ohlcv));
    }

    await this.chartRepository.updateMultiple(charts);
    Workspace.addCharts(charts);
  }

  private async createChart(timeframe: TimeFrame, ticker: Ticker): Promise<Chart> {
    const chart: Chart = {
      id: Guid.create().toString(),
      ticker,
      timeframe,
      indicators: [],
      candlesticks: []
    };

    const ohlcvs = await Workspace.getExchange(ticker.exchangeId).fetchChartInit(ticker, timeframe);
    ohlcvs.forEach(ohlcv => this.addOrUpdateCandlestick(chart, ohlcv));

    return chart;
  }
  
  addIndicator = (chart: Chart, indicator: Indicator): void => {
    if (chart.indicators.findIndex(x => IndicatorHelper.areEqual(x, indicator)) > -1) return;

    if (indicator.source !== 'close') this.addIndicator(chart, indicator.source);
    IndicatorServiceProvider.get(indicator).getDependencies()
      .forEach(dependencyIndicator => this.addIndicator(chart, dependencyIndicator));
 
    chart.indicators = [...new Set(chart.indicators).add(indicator)];

    for (let index = chart.candlesticks.length - 1; index >= 0; index--) {
      IndicatorServiceProvider.get(indicator).calculate(chart, index);
    }
  }

  private addOrUpdateCandlestick = (chart: Chart, ohlcv: OHLCV): void => {
    // We remove additional time to have the timestamp corresponding to the timeframe of the chart
    const ohlcvTimestamp = ohlcv.timestamp - ohlcv.timestamp % TimeFrameHelper.toMilliseconds(chart.timeframe);

    const currentCandlestick = chart.candlesticks[0];
    const isNewCandle = currentCandlestick?.timestamp !== ohlcvTimestamp;
    const isClosed = chart.timeframe === ohlcv.timeframe || ohlcv.timestamp + TimeFrameHelper.toMilliseconds(ohlcv.timeframe) === currentCandlestick.timestamp + TimeFrameHelper.toMilliseconds(chart.timeframe);

    if (isNewCandle) {
      if (chart.candlesticks.length === CHART_CANDLESTICKS_COUNT) chart.candlesticks.pop(); // Remove last element to always have same number of elements in candlesticks array
      const newCandlestick: Candlestick = {
        timestamp: ohlcvTimestamp,
        open: ohlcv.open,
        high: ohlcv.high,
        low: ohlcv.low,
        close: ohlcv.close,
        volume: ohlcv.volume,
        isClosed,
        indicators: {}
      };
      chart.candlesticks.unshift(newCandlestick);
    }
    else {
      const existingCandlestick = chart.candlesticks[0];
      chart.candlesticks[0] = {
        ...existingCandlestick,
        high: Math.max(existingCandlestick.high, ohlcv.high),
        low: Math.min(existingCandlestick.low, ohlcv.low),
        close: ohlcv.close,
        volume: ohlcv.volume, // TODO : si la timeframe est différente alors le volume n'est pas le bon
        isClosed,
      };
    }

    chart.indicators.forEach(indicator => IndicatorServiceProvider.get(indicator).calculate(chart));
  }
}