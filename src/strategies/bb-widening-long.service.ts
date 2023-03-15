import ChartHelper from '../helpers/chart.helper';
import BollingerBandsValue from '../indicators/bollinger-bands/bollinger-bands-value';
import IndicatorValue from '../indicators/indicator-value';
import MovingAverageValue from '../indicators/moving-average/moving-average-value';
import Trade from '../models/trade';
import Workspace from '../workspace/workspace';
import BaseStrategyService from './base-strategy.service';
import BBWideningLongStrategy from './bb-widening-long.strategy';

export default class BBWideningLongService extends BaseStrategyService {
  strategy: BBWideningLongStrategy;

  constructor(strategy: BBWideningLongStrategy) {
    super(strategy);
    this.strategy = strategy;
  }

  private get bb(): BollingerBandsValue {
    const { indicator: bb, timeframe } = this.strategy.indicators.find(x => x.indicator.type === 'bb') ?? {};
    if (!timeframe) throw new Error('Timeframe should be defined');
    if (!bb) throw new Error('BB should be defined');

    const chart = Workspace.getChart(this.strategy.ticker, timeframe);
    if (!chart) throw new Error('Chart should be defined');

    const value = ChartHelper.getIndicatorValue(chart, 0, bb);
    if (!value) throw new Error('Bollinger bands value should be defined');
    return value as BollingerBandsValue;
  }

  private get sma(): MovingAverageValue {
    const { indicator: sma, timeframe } =
      this.strategy.indicators.find(x => x.indicator.type === 'sma') ?? {};
    if (!timeframe) throw new Error('Timeframe should be defined');
    if (!sma) throw new Error('SMA should be defined');

    const chart = Workspace.getChart(this.strategy.ticker, timeframe);
    if (!chart) throw new Error('Chart should be defined');

    const value = ChartHelper.getIndicatorValue(chart, 0, sma);
    if (!value) throw new Error('Bollinger bands value should be defined');
    return value as MovingAverageValue;
  }

    private get rsi(): IndicatorValue {
    const { indicator: rsi, timeframe } =
      this.strategy.indicators.find(x => x.indicator.type === 'rsi') ?? {};
    if (!timeframe) throw new Error('Timeframe should be defined');
    if (!rsi) throw new Error('RSI should be defined');

    const chart = Workspace.getChart(this.strategy.ticker, timeframe);
    if (!chart) throw new Error('Chart should be defined');

    const value = ChartHelper.getIndicatorValue(chart, 0, rsi);
    if (!value) throw new Error('Bollinger bands value should be defined');
    return value as MovingAverageValue;
  }

  async execute(): Promise<void> {
    if (!this.currentTrade) {
      const buySignal = this.currentCandlestick.isClosed
        && this.priceAboseSMA // prix au dessus de la MM
        && this.smaIsGoingUp // MM haussière
        && this.bbWidening // BB qui s'écartent
        && this.bbWideEnough
        // && this.candlestickIsGreen
        //&& this.priceNotTooFarFromSma // prix pas trop loin de MM20 (SL), donc limite le risque

      if (buySignal) {
        const tp = this.rsi.value > 80 ? this.strategy.tp * 1.4 : this.strategy.tp;
        const trade = await this.openTrade(tp);
        Workspace.store.trades.push(trade);
        this.strategy.currentTradeId = trade.id;
        this.strategy.updated = true;
      }
      
      return;
    }

    const sellSignal = this.currentTrade && this.priceDownAndTouchedSMA;
    if (sellSignal) {
      await this.closeCurrentTrade();
    }
  }

  private get bbWidening(): boolean {
    return this.bb.phase === 'widening';
  }

  private get bbWideEnough(): boolean {
    return this.bb.width > this.strategy.bbMinWidth; // valable pour 1H
  }

  private get candlestickIsGreen(): boolean {
    return this.currentCandlestick.close >= this.currentCandlestick.open;
  }

  private get priceAboseSMA(): boolean {
    return this.currentCandlestick.close >= this.sma.value;
  }

  private get closeOutsideBB(): boolean {
    return this.currentCandlestick.close >= this.bb.upper;
  }

  private get priceDownAndTouchedSMA(): boolean {
    return this.currentCandlestick.close <= this.sma.value;
  }

  private get smaIsGoingUp(): boolean {
    return this.sma.direction === 'up';
  }

  private get priceNotTooFarFromSma(): boolean {
    return (this.currentCandlestick.close / this.bb.basis) - 1 < 0.01;
  }

  private async openTrade(tp: number): Promise<Trade> {
    const quantity = +(this.availableBalance / this.currentCandlestick.close).toFixed(4); // Use all balance and round

    const trade = await Workspace.service.trade.openTrade(
      this.strategy.ticker,
      quantity,
      [
        { quantity, price: this.currentCandlestick.close * (1 + tp) },
      ],
      null);
      // this.currentCandlestick.low);
      // this.lowestPriceLastCandlesticks);
    
    this.strategy.currentTradeId = trade.id;
    return trade;
  }

  private get lowestPriceLastCandlesticks(): number {
    return Math.min(this.getCandlestick().low, this.getCandlestick(1).low, this.getCandlestick(2).low);
  }
}