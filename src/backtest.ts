import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import ExchangeService from './exchange-service/exchange.service';
import ReadOnlyExchangeService from './exchange-service/read-only-exchange.service';
import Candle from './models/candle';
import Chart from './models/chart';
import ChartWorkspace from './models/chart-workspace';
import Strategy from './strategies/strategy';
import { default as TradeManager } from './trade-manager';
import TradingWorker from './trading-worker/trading-worker';

export default class BackTest extends TradingWorker {
  protected symbol: string;
  protected startDate: string;
  protected endDate: string;
  protected startTimestamp: number = 0;
  protected endTimestamp: number = 0;
  protected exchangeId: ExchangeId;
  private lastCandle: Candle | null = null;

  constructor(
    strategy: Strategy,
    tickTimeFrame: TimeFrame,
    startDate: string,
    endDate: string,
    symbol: string,
    exchangeId: ExchangeId
  ) {
    super(tickTimeFrame, strategy);
    this.startDate = startDate;
    this.endDate = endDate;
    this.symbol = symbol;
    this.exchangeId = exchangeId;
  }

  protected initExchangeService = (): ExchangeService => new ReadOnlyExchangeService(this.exchangeId);

  private async initChartForTimeframe(timeframe: TimeFrame): Promise<Chart> {
    this.startTimestamp = this.exchangeService.parse8601(this.startDate);
    this.endTimestamp = this.exchangeService.parse8601(this.endDate);
    // récupérer en plus les 50 périodes précédentes pour être tranquilles sur les calculs
    const startMinus10Periods = this.startTimestamp - TimeFrame.toMilliseconds(timeframe) * 50;
    const data = await this.exchangeService.fetchOHLCVRange(this.symbol, timeframe, startMinus10Periods, this.startTimestamp);

    const chart = new Chart(this.symbol, timeframe, data);

    return chart;
  }

  protected initTradeManager = (): TradeManager => new TradeManager(this.exchangeService);

  protected initChartWorkspace = async (timeframes: TimeFrame[]): Promise<ChartWorkspace> => {
    if (timeframes.length === 0) throw new Error('At least one timeframe should be defined.');
    timeframes.sort(TimeFrame.compare);

    const chartWorkspace = new ChartWorkspace(this.symbol);

    for (const timeframe of timeframes) {
      const chart = await this.initChartForTimeframe(timeframe);
      chartWorkspace.set(timeframe, chart);
    }

    const chartLowerTimeframe = chartWorkspace.get(timeframes[0]);
    if (chartLowerTimeframe) (this.exchangeService as ReadOnlyExchangeService).addChart(chartLowerTimeframe);

    return chartWorkspace;
  }

  async launch(): Promise<void> {
    console.log('Backtest - launch');
    const ticks = await this.exchangeService.fetchOHLCVRange(this.symbol, this.tickTimeFrame, this.startTimestamp, this.endTimestamp);
    console.log('ticks number', ticks.length);

    for (const tick of ticks) {
      this.lastCandle = new Candle(tick);
      await this.onTick();
    }

    this.tradeManager.getPerformance();
  }

  protected async fetchLastCandle(): Promise<Candle> {
    if (!this.lastCandle) throw new Error('Last candle should not be null');
    return this.lastCandle;
  }
}
