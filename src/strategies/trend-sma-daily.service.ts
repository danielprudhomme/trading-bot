import BollingerBandsValue from '../indicators/bollinger-bands/bollinger-bands-value';
import MovingAverageValue from '../indicators/moving-average/moving-average-value';
import SupertrendValue from '../indicators/supertrend/supertrend-value';
import Workspace from '../workspace/workspace';
import BaseStrategyService from './base-strategy.service';
import TrendSmaDailyStrategy from './trend-sma-daily.strategy';

export default class TrendSmaDailyStrategyService extends BaseStrategyService {

  constructor(strategy: TrendSmaDailyStrategy) {
    super(strategy);
  }

  async execute(): Promise<void> {
    const smaDaily = this.getIndicatorValue<MovingAverageValue>('sma', '1d');
    const bbDaily = this.getIndicatorValue<BollingerBandsValue>('bb', '1d');
    const bb = this.getIndicatorValue<BollingerBandsValue>('bb', (this.strategy as TrendSmaDailyStrategy).timeframe);
    const supertrend = this.getIndicatorValue<SupertrendValue>('supertrend', (this.strategy as TrendSmaDailyStrategy).timeframe);

    const close = this.currentCandlestick.close;
    const high = this.currentCandlestick.high;

    const buySignal =
      !this.currentTrade &&
      smaDaily.direction === 'up' &&
      close > smaDaily.value && 
      bb.phase === 'widening' &&
      close > bb.basis &&
      // TODO : rajouter le check : pas trop haut par rapport aux bb daily fermées
      supertrend.direction === 'up';

    if (buySignal) {
      await this.openTrade();
    }

    const sellSignal =
      this.currentTrade && (
        supertrend.direction === 'down' ||
        (close < smaDaily.value) ||
        (high > bbDaily.upper && bbDaily.phase !== 'widening')
      );

    if (sellSignal) {
      await this.closeCurrentTrade();
    }
  }

  private async openTrade(): Promise<void> {
    const quantity = +(this.availableBalance / this.currentCandlestick.close).toFixed(4); // Use all balance and round

    const trade = await Workspace.service.trade.openTrade(
      this.strategy.ticker,
      quantity,
      null,
      null);
    
    Workspace.store.trades.push(trade);
    this.strategy.currentTradeId = trade.id;
    this.strategy.updated = true;
    this.currentTrade = trade;
  }
}