import ExchangeId from './enums/exchange-id';
import TimeFrame from './enums/timeframe';
import ExchangeService from './exchange-service/exchange.service';
import ReadOnlyExchangeService from './exchange-service/read-only-exchange.service';
import Candle from './models/candle';
import Chart from './models/chart';
import MACDZeroLagStrategy from './strategies/macd-zero-lag.strategy';
import Strategy from './strategies/strategy';
import { default as TradeManager } from './trade-manager';
import TradingWorker from './trading-worker/trading-worker';

export default class BackTest extends TradingWorker {
  private symbol: string;
  private startDate: string;
  private endDate: string;
  private startTimestamp: number = 0;
  private endTimestamp: number = 0;
  private exchangeId: ExchangeId;
  private lastCandle: Candle | null = null;

  constructor(chartTimeFrame: TimeFrame, tickTimeFrame: TimeFrame, startDate: string, endDate: string, symbol: string, exchangeId: ExchangeId) {
    super(chartTimeFrame, tickTimeFrame);
    this.startDate = startDate;
    this.endDate = endDate;
    this.symbol = symbol;
    this.exchangeId = exchangeId;
  }

  protected initExchangeService = (): ExchangeService => new ReadOnlyExchangeService(this.exchangeId);

  protected async initChart(): Promise<Chart> {
    console.log('Backtest - initChart');
    this.startTimestamp = this.exchangeService.parse8601(this.startDate);
    this.endTimestamp = this.exchangeService.parse8601(this.endDate);
    // récupérer en plus les 50 périodes précédentes pour être tranquilles sur les calculs
    const startMinus10Periods = this.startTimestamp - TimeFrame.toMilliseconds(this.chartTimeFrame) * 50;
    const data = await this.exchangeService.fetchOHLCVRange(this.symbol, this.chartTimeFrame, startMinus10Periods, this.startTimestamp);

    const chart = new Chart(this.symbol, this.chartTimeFrame, data);

    (this.exchangeService as ReadOnlyExchangeService).addChart(chart);
    return chart;
  }

  protected initTradeManager = (): TradeManager => new TradeManager(this.exchangeService, this.chart);

  protected initStategy = (): Strategy => new MACDZeroLagStrategy(this.chart, this.tradeManager);

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
