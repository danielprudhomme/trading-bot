import TimeFrame from '../enums/timeframe';
import MacdZeroLag from '../indicators/macd-zero-lag/macd-zero-lag';
import MacdZeroLagValue from '../indicators/macd-zero-lag/macd-zero-lag-value';
import Trade from '../models/trade';
import StrategyOneTimeFrame from './strategy-one-timeframe';

export default class MACDZeroLagStrategy extends StrategyOneTimeFrame {
  private waitForFirstSignal = true;
  private macdZeroLag = new MacdZeroLag();
  private currentTrade: Trade | null = null; // ONE TRADE AT A TIME

  constructor(timeframe: TimeFrame) {
    super(timeframe);
  }

  addIndicators(): void {
    this.chart.addIndicator(this.macdZeroLag);
  }

  async execute(): Promise<void> {
    const currentCandlestick = this.chart.currentCandlestick;
    console.log({currentCandlestick});

    if (!this.currentTrade?.isOpen) this.currentTrade = null;

    if (this.macdAboveSignal && !this.currentTrade && !this.waitForFirstSignal) { // BUY SIGNAL
      console.log('buy signal')
      this.currentTrade = Trade.openAtMarket(this.chart.symbol, 1) // get quantity from wallet
      
      // TP1 at +0,2%
      const tp1Price = currentCandlestick.close * 1.002;
      this.currentTrade.addTakeProfit(0.5, tp1Price);

      // TP2 at +0,5%
      const tp2Price = currentCandlestick.close * 1.005;
      this.currentTrade.addTakeProfit(0.5, tp2Price);

      const slPrice = currentCandlestick.low;
      this.currentTrade.addStopLoss(slPrice);

      await this.tradeManager.create(this.currentTrade, currentCandlestick);
    }

    if (!this.macdAboveSignal) {
      this.waitForFirstSignal = false;
      
      if (this.currentTrade) {
        console.log('sell signal');
        await this.tradeManager.close(this.currentTrade, currentCandlestick);
        this.currentTrade = null;
      }
    }
  }

  private get macdAboveSignal(): boolean {
    return (this.chart.currentCandlestick.getIndicatorValue(this.macdZeroLag) as MacdZeroLagValue).macdAboveSignal;
  }
}
