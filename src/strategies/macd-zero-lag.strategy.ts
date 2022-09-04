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

    if (this.macdAboveSignal && !this.currentTrade) { // BUY SIGNAL
      console.log('buy signal')
      this.currentTrade = Trade.openAtMarket(this.chart.symbol, 1) // get quantity from wallet
      
      // TP at +0,5%
      const tpPrice = this.chart.currentCandle.close * 1.005;
      console.log('tp price', tpPrice);
      this.currentTrade.addTakeProfit(1, tpPrice);

      await this.tradeManager.create(this.currentTrade);
    }

    // if (!this.macdAboveSignal && this.currentTrade) {
    //   console.log('sell signal');
    //   await this.tradeManager.close(this.currentTrade);
    //   this.currentTrade = null;
    // }
  }

  private get macdAboveSignal(): boolean {
    return (this.chart.currentCandle.getIndicatorValue(this.macdZeroLag) as MacdZeroLagValue).macdAboveSignal;
  }
}
