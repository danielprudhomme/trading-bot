import Trade from "./models/trade";

export default class FakeWallet {
  initialUsdAmount: number;
  usd: number;
  asset = 0;
  fees = 0.001;
  trades: Trade[];

  constructor(initialUsdAmount: number = 1000) {
    this.initialUsdAmount = initialUsdAmount;
    this.usd = initialUsdAmount;
    this.trades = [];
  }

  buy(timestamp: number, price: number) {
    const fee = this.usd * this.fees;
    this.asset = (this.usd - fee) / price;
    this.usd = 0;
    this.trades.push(new Trade(timestamp, price, this.asset));
  }

  sell(timestamp: number, price: number) {
    const currentTrade = this.trades.find(x => x.isOpen);
    currentTrade?.close(timestamp, price, this.asset);

    this.usd = this.asset * price;
    this.usd -= this.usd * this.fees;
    this.asset = 0;
  }

  revertLastOpenTrade() {
    const currentTrade = this.trades.find(x => x.isOpen);
    if (currentTrade) {
      this.usd = this.asset * currentTrade.openOrder.price;
      this.asset = 0;
      this.trades.pop();
    }
  }

  print() {
    this.trades.forEach((trade, i) =>
      console.log(i,
        new Date(trade.openOrder.timestamp),
        trade.openOrder.price,
        trade.closeOrder ? new Date(trade.closeOrder.timestamp) : '',
        trade.closeOrder ? trade.closeOrder.price : '',
        trade.pnl,
        this.toPercent(trade.performance)
        ));
    console.log('Performance : ', this.toPercent(this.usd / this.initialUsdAmount - 1));
  }

  toPercent = (value: number) => `${(value*100).toFixed(2)}%`;
}


