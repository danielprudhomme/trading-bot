import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import ExchangeService from './exchange-service/exchange.service';
import ReadOnlyExchangeService from './exchange-service/read-only-exchange.service';
import Candlestick from './models/candlestick';
import Chart from './models/chart';
import ChartWorkspace from './models/chart-workspace';
import { Symbol } from './models/symbol';
import Strategy from './strategies/strategy';
import { default as TradeManager } from './trade-manager';
import TradingWorker from './trading-worker/trading-worker';

export default class BackTest extends TradingWorker {
  protected symbol: Symbol;
  protected startDate: string;
  protected endDate: string;
  protected startTimestamp: number = 0;
  protected endTimestamp: number = 0;
  protected exchangeId: ExchangeId;
  private lastCandlestick: Candlestick | null = null;

  constructor(
    strategy: Strategy,
    tickTimeFrame: TimeFrame,
    startDate: string,
    endDate: string,
    exchangeId: ExchangeId
  ) {
    super(tickTimeFrame, strategy);
    this.startDate = startDate;
    this.endDate = endDate;
    this.symbol = strategy.symbol;
    this.exchangeId = exchangeId;
  }

  protected initExchangeService = (): ExchangeService => new ReadOnlyExchangeService(this.exchangeId);

  private async initChartForTimeframe(timeframe: TimeFrame): Promise<Chart> {
    // récupérer en plus les 50 périodes précédentes pour être tranquilles sur les calculs
    const startMinusXPeriods = this.startTimestamp - TimeFrame.toMilliseconds(timeframe) * 50;
    const data = await this.exchangeService.fetchOHLCVRange(this.symbol, timeframe, startMinusXPeriods, this.startTimestamp);

    const chart = new Chart(timeframe, data);

    return chart;
  }

  protected initTradeManager = (): TradeManager => new TradeManager(this.exchangeService);

  protected initChartWorkspace = async (timeframes: TimeFrame[]): Promise<ChartWorkspace> => {
    if (timeframes.length === 0) throw new Error('At least one timeframe should be defined.');
    timeframes.sort(TimeFrame.compare);

    this.startTimestamp = this.exchangeService.parse8601(this.startDate);
    this.endTimestamp = this.exchangeService.parse8601(this.endDate);

    const chartWorkspace = new ChartWorkspace();

    for (const timeframe of timeframes) {
      const chart = await this.initChartForTimeframe(timeframe);
      chartWorkspace.set(timeframe, chart);
    }

    const chartLowestTimeframe = chartWorkspace.get(timeframes[0]);
    if (chartLowestTimeframe) (this.exchangeService as ReadOnlyExchangeService).addChart(chartLowestTimeframe);

    return chartWorkspace;
  }

  async launch(): Promise<void> {
    const ticks = await this.exchangeService.fetchOHLCVRange(this.symbol, this.tickTimeFrame, this.startTimestamp, this.endTimestamp);
    console.log('Backtest - launch', ticks.length, 'ticks');

    for (const tick of ticks) {
      this.lastCandlestick = new Candlestick(tick);
      await this.onTick();
    }

    this.tradeManager.getPerformance();
  }

  protected async fetchLastCandlestick(): Promise<Candlestick> {
    if (!this.lastCandlestick) throw new Error('Last candlestick should not be null');
    return this.lastCandlestick;
  }
}
