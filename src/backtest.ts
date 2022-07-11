import TimeFrame from './enums/timeframe';
import ExchangeService from './exchange.service';
import FakeWallet from './fake-wallet';
import { findLastIndex } from './helpers/array';
import Ohlcv from './models/ohlcv';
import MA10Strategy from './strategies/ma10.strategy';

export default class BackTest {
  private exchange: ExchangeService;

  private symbol = 'BTC/USDT';

  constructor(exchange: ExchangeService) {
    this.exchange = exchange;
  }

  async launch(): Promise<void> {
    const wallet = new FakeWallet();
    
    const start = this.exchange.parse8601('2022-05-01T00:00:00Z');
    const end = this.exchange.parse8601('2022-07-10T00:00:00Z');

    const ticks = await this.exchange.fetchRange(this.symbol, TimeFrame.t1h, start, end);

    // récupérer en plus les 10 périodes précédents la date qu'on veut (pour calculer la MM10)
    const timeframe = TimeFrame.t1d;
    const startMinus10Periods = start - TimeFrame.toMilliseconds(timeframe) * 10;
    const ohlcvs = await this.exchange.fetchRange(this.symbol, timeframe, startMinus10Periods, end);

    const strategy = new MA10Strategy(wallet);
    ticks.forEach(tick => this.onTick(strategy, ohlcvs, tick));

    if (wallet.usd === 0) {
      wallet.revertLastOpenTrade();
    }
    
    wallet.print();
  }

  onTick = (strategy: MA10Strategy, ohlcvs: Ohlcv[], tick: Ohlcv): void => {
    // remplacer dans ohlcvs par la valeur du tick (close)
    const index = findLastIndex(ohlcvs, x => x.timestamp <= tick.timestamp);
    const ohlcvsAtTick = ohlcvs.slice(0, index + 1);
    ohlcvsAtTick[index].close = tick.close;

    strategy.execute(tick.timestamp, ohlcvsAtTick);
  }
}
