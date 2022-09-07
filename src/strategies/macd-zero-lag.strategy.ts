import MacdZeroLag from '../indicators/macd-zero-lag';
import MacdZeroLagValue from '../indicators/macd-zero-lag-value';
import Chart from '../models/chart';
import Trade from '../models/trade';
import TradeManager from '../trade-manager';
import Strategy from './strategy';

export default class MACDZeroLagStrategy extends Strategy {
  private waitForFirstSignal = true;
  private macdZeroLag = new MacdZeroLag();
  private currentTrade: Trade | null = null; // ONE TRADE AT A TIME

  constructor(chart: Chart, tradeManager: TradeManager) {
    super(chart, tradeManager);
    this.chart.addIndicator(this.macdZeroLag);
  }

  async execute(): Promise<void> {

    if (!this.currentTrade?.isOpen) this.currentTrade = null;

    if (this.macdAboveSignal && !this.currentTrade && !this.waitForFirstSignal) { // BUY SIGNAL
      console.log('buy signal')
      this.currentTrade = Trade.openAtMarket(this.chart.symbol, 1) // get quantity from wallet
      
      // TP1 at +0,2%
      const tp1Price = this.chart.currentCandle.close * 1.002;
      this.currentTrade.addTakeProfit(0.5, tp1Price);

      // TP2 at +0,5%
      const tp2Price = this.chart.currentCandle.close * 1.005;
      this.currentTrade.addTakeProfit(0.5, tp2Price);

      const slPrice = this.chart.currentCandle.low;
      this.currentTrade.addStopLoss(slPrice);

      await this.tradeManager.create(this.currentTrade);
    }

    if (!this.macdAboveSignal) {
      this.waitForFirstSignal = false;
      
      if (this.currentTrade) {
        console.log('sell signal');
        await this.tradeManager.close(this.currentTrade);
        this.currentTrade = null;
      }
    }
  }

  private get macdAboveSignal(): boolean {
    return (this.chart.currentCandle.getIndicatorValue(this.macdZeroLag) as MacdZeroLagValue).macdAboveSignal;
  }
}
