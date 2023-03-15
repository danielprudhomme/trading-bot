import BollingerBandsValue from '../indicators/bollinger-bands/bollinger-bands-value';
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
        const tp = this.getIndicatorValue('rsi', this.strategy.timeframe).value > 80 ? this.strategy.tp * 1.4 : this.strategy.tp;
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
    return this.getIndicatorValue<BollingerBandsValue>('bb', this.strategy.timeframe).phase === 'widening';
  }

  private get bbWideEnough(): boolean {
    return this.getIndicatorValue<BollingerBandsValue>('bb', this.strategy.timeframe).width > this.strategy.bbMinWidth; // valable pour 1H
  }

  private get candlestickIsGreen(): boolean {
    return this.currentCandlestick.close >= this.currentCandlestick.open;
  }

  private get priceAboseSMA(): boolean {
    return this.currentCandlestick.close >= this.getIndicatorValue<MovingAverageValue>('sma', this.strategy.timeframe).value;
  }

  private get closeOutsideBB(): boolean {
    return this.currentCandlestick.close >= this.getIndicatorValue<BollingerBandsValue>('bb', this.strategy.timeframe).upper;
  }

  private get priceDownAndTouchedSMA(): boolean {
    return this.currentCandlestick.close <= this.getIndicatorValue<MovingAverageValue>('sma', this.strategy.timeframe).value;
  }

  private get smaIsGoingUp(): boolean {
    return this.getIndicatorValue<MovingAverageValue>('sma', this.strategy.timeframe).direction === 'up';
  }

  private get priceNotTooFarFromSma(): boolean {
    return (this.currentCandlestick.close / this.getIndicatorValue<BollingerBandsValue>('bb', this.strategy.timeframe).basis) - 1 < 0.01;
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