import TimeFrame from '../enums/timeframe';
import Indicator from '../indicators/indicator';
import IndicatorServiceProvider from '../indicators/indicator-service-provider';
import ChartRepository from '../infrastructure/repositories/chart.repository';
import Candlestick from '../models/candlestick';
import Chart from '../models/chart';
import { OHLCV } from '../models/ohlcv';
import Strategy from '../models/strategy';
import Workspace from '../workspace';

export default class ChartService {
  private chartRepository: ChartRepository;

  constructor(
    chartRepository: ChartRepository,
  ) {
    this.chartRepository = chartRepository;
  }

  /* Fetch all charts */
  async fetchAll(): Promise<void> {
    const charts = await this.chartRepository.getAll();
    Workspace.addCharts(charts);
  }

  addStrategyIndicators(strategies: Strategy[]): void {
    // strategy ticker et indicator (timeframe)
    // get chart for ticker and timeframe, and add indicator
    strategies.forEach(strategy => {
      strategy.indicators.forEach(indicator => {
        const chart = Workspace.getChart(strategy.ticker, indicator.timeframe);
        if (chart) this.addIndicator(chart, indicator);
      });
    });
  }

  /* Update all charts with exchange */
  async updateAllWithExchange(tickTimeframe: TimeFrame): Promise<void> {
    const charts = Workspace.getCharts();

    const updatedCharts: Chart[] = [];
    for (const chartsByTicker of Array.from(charts.values()).map(c => Array.from(c.values()))) {
      const ticker = chartsByTicker[0].ticker;
      const ohlcvs = await Workspace.getExchange(ticker.exchangeId).fetchOHLCV(ticker, tickTimeframe); // TODO: avec limit = 1, car on a besoin que d'une bougie
      chartsByTicker.forEach(chart => {
        this.update(chart, ohlcvs[ohlcvs.length - 1]);
        updatedCharts.push(chart);
      });
    }

    await this.chartRepository.updateMultiple(updatedCharts);
  }

  addIndicator = (chart: Chart, indicator: Indicator): void => {
    const indicators = new Set(chart.indicators);

    if (indicator.source !== 'close') this.addIndicator(chart, indicator.source);
    IndicatorServiceProvider.get(indicator).getDependencies()
      .forEach(dependencyIndicator =>  this.addIndicator(chart, dependencyIndicator));
    indicators.add(indicator);

    chart.indicators = [...indicators];
  }

  private update = (chart: Chart, ohlcv: OHLCV): void => {
    const isNewCandle = Number.isInteger(ohlcv.timestamp / TimeFrame.toMilliseconds(chart.timeframe));

    if (!isNewCandle) chart.candlesticks.shift();
    // TODO : si c'est un update (pas newCandle), il ne faut pas forcément tout mettre à jour (open, high, low)
    const candlestick: Candlestick = {
      timestamp: ohlcv.timestamp,
      open: ohlcv.open,
      high: ohlcv.high,
      low: ohlcv.low,
      close: ohlcv.close,
      volume: ohlcv.volume,
      isClosed: Number.isInteger((ohlcv.timestamp + TimeFrame.toMilliseconds(ohlcv.timeframe)) / TimeFrame.toMilliseconds(chart.timeframe)),
      indicators: {}
    };
    chart.candlesticks.unshift(candlestick);

    chart.indicators.forEach(indicator => IndicatorServiceProvider.get(indicator).calculate(chart));
  }
}