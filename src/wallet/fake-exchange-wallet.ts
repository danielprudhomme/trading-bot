import { OrderSide } from "../enums/order-side";
import Chart from "../models/chart";
import ExchangeWallet from "./exchange-wallet";

// simplified version with only one asset (chart BTC/UDT for example)
export default class FakeExchangeWallet extends ExchangeWallet {
  chart: Chart;
  initialUsdAmount: number;
  usdAmount: number;
  assetAmount = 0;
  fees: number;

  constructor(chart: Chart, initialUsdAmount: number, fees: number) {
    super();
    this.chart = chart;
    this.initialUsdAmount = initialUsdAmount;
    this.usdAmount = initialUsdAmount;
    this.fees = fees;
  }

  marketOrder(symbol: string, side: OrderSide, amount: number): void {
    const currentPrice = this.chart.getLastCandle().close;

    if (side === OrderSide.Buy) {
      const usdValue = amount * currentPrice;
      if (usdValue > this.usdAmount)
        throw new Error('Not enough usd for transaction.');
      this.assetAmount += amount * (1 - this.fees);
      this.usdAmount -= usdValue;
      return;
    }

    if (amount > this.assetAmount)
      throw new Error('Not enough asset for transaction.');
    this.assetAmount -= amount;
    this.usdAmount += (amount * currentPrice) * (1 - this.fees);
  }
}