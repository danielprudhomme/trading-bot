import Chart from '../models/chart';
import ExchangeWallet from '../wallet/exchange-wallet';

export default abstract class Strategy {
  private chart: Chart;
  private exchangeWallet: ExchangeWallet;

  constructor(chart: Chart, exchangeWallet: ExchangeWallet) {
    this.chart = chart;
    this.exchangeWallet = exchangeWallet;
  }
  
  abstract execute(timestamp: number): void;
}