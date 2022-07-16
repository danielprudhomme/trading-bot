import TimeFrame from './enums/timeframe';
import ExchangeService from './exchange.service';
import Candle from './models/candle';
import Chart from './models/chart';
import MACDZeroLagStrategy from './strategies/macd-zero-lag.strategy';
import Strategy from './strategies/strategy';
import ExchangeWallet from './wallet/exchange-wallet';
import FakeExchangeWallet from './wallet/fake-exchange-wallet';

export default class BackTest {
  private exchange: ExchangeService;

  private symbol = 'BTC/USDT';

  constructor(exchange: ExchangeService) {
    this.exchange = exchange;
  }

  async launch(): Promise<void> {    
    const start = this.exchange.parse8601('2022-07-03T00:00:00Z');
    // const start = this.exchange.parse8601('2022-07-02T00:00:00Z');
    const end = this.exchange.parse8601('2022-07-13T00:00:00Z');

    const ticks = await this.exchange.fetchRange(this.symbol, TimeFrame.t1h, start, end);

    // récupérer en plus les 50 périodes précédentes pour être tranquilles sur les calculs
    const timeframe = TimeFrame.t1h;
    const startMinus10Periods = start - TimeFrame.toMilliseconds(timeframe) * 50;
    const data = await this.exchange.fetchRange(this.symbol, timeframe, startMinus10Periods, end);

    const chart = new Chart(timeframe, data);
    const exchangeWallet = new FakeExchangeWallet(chart, 1000, 0.001);

    const strategy = new MACDZeroLagStrategy(chart, exchangeWallet);
    ticks.forEach(tick => this.onTick(new Candle(tick), strategy, chart, exchangeWallet));

    // if (wallet.usd === 0) {
    //   wallet.revertLastOpenTrade();
    // }
    
    // wallet.print();
  }

  onTick = (newCandle: Candle, strategy: Strategy, chart: Chart, exchangeWallet: ExchangeWallet): void => {
    const timestamp = newCandle.timestamp;
    chart.newCandle(newCandle);
    strategy.execute(timestamp);
  }
}
