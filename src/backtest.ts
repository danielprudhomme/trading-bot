import TimeFrame from './enums/timeframe';
import exchange from './infrastructure/exchange-service/exchange.service';
import ReadOnlyExchangeService from './infrastructure/exchange-service/read-only-exchange.service';
import Chart from './models/chart';
import ChartWorkspace from './models/chart-workspace';
import { OHLCV } from './models/ohlcv';
import Ticker from './models/ticker';
import PerformanceCalculator from './performance-calculator';
import Strategy from './strategies/strategy';
import TradingWorker from './trading-worker/trading-worker';
import Workspace from './workspace';

export default class BackTest extends TradingWorker {
  protected ticker: Ticker;
  protected startDate: string;
  protected endDate: string;
  protected startTimestamp: number = 0;
  protected endTimestamp: number = 0;
  private lastOhlcv: OHLCV | null = null;

  constructor(
    strategy: Strategy,
    tickTimeFrame: TimeFrame,
    startDate: string,
    endDate: string,
  ) {
    super(tickTimeFrame, strategy);
    this.startDate = startDate;
    this.endDate = endDate;
    this.ticker = strategy.ticker;
  }

  protected get exchange(): exchange {
    return Workspace.getExchange(this.ticker.exchangeId);
  }

  private async initChartForTimeframe(timeframe: TimeFrame): Promise<Chart> {
    // récupérer en plus les 50 périodes précédentes pour être tranquilles sur les calculs
    const startMinusXPeriods = this.startTimestamp - TimeFrame.toMilliseconds(timeframe) * 50;
    const data = await this.exchange.fetchOHLCVRange(this.ticker, timeframe, startMinusXPeriods, this.startTimestamp);

    const chart = new Chart(timeframe, data);

    return chart;
  }

  protected initChartWorkspace = async (timeframes: TimeFrame[]): Promise<ChartWorkspace> => {
    if (timeframes.length === 0) throw new Error('At least one timeframe should be defined.');
    timeframes.sort(TimeFrame.compare);

    this.startTimestamp = this.exchange.parse8601(this.startDate);
    this.endTimestamp = this.exchange.parse8601(this.endDate);

    const chartWorkspace = new ChartWorkspace();

    for (const timeframe of timeframes) {
      const chart = await this.initChartForTimeframe(timeframe);
      chartWorkspace.set(timeframe, chart);
    }

    const chartLowestTimeframe = chartWorkspace.get(timeframes[0]);
    if (chartLowestTimeframe) (this.exchange as ReadOnlyExchangeService).addChart(chartLowestTimeframe);

    return chartWorkspace;
  }

  async launch(): Promise<void> {
    console.log('Backtest - launch');
    const ticks = await this.exchange.fetchOHLCVRange(this.ticker, this.tickTimeFrame, this.startTimestamp, this.endTimestamp);
    console.log('Fetched : ', ticks.length, 'ticks');

    for (const tick of ticks) {
      this.lastOhlcv = tick;
      await this.onTick();
    }

    const trades = await this.tradeRepository.getAll();
    PerformanceCalculator.getPerformance(trades);
  }

  protected async fetchLastOHLCV(): Promise<OHLCV> {
    if (!this.lastOhlcv) throw new Error('Last OHLCV should not be null');
    return this.lastOhlcv;
  }
}
