import TimeFrame from './enums/timeframe';
import ExchangeService from './exchange.service';
import { findLastIndex } from './helpers/array';
import Ohlcv from './models/ohlcv';
import MA10Strategy from './strategies/ma10-strategy';

export default class BackTest {
  private exchange: ExchangeService;

  private symbol = 'BTC/USDT';

  constructor(exchange: ExchangeService) {
    this.exchange = exchange;
  }

  async launch(): Promise<void> {
    const start = this.exchange.parse8601('2022-07-07T05:00:00Z');
    const end = this.exchange.parse8601('2022-07-08T06:00:00Z');

    const ticks = await this.exchange.fetchRange(this.symbol, TimeFrame.t1m, start, end);

    // récupérer en plus les 10 périodes précédents la date qu'on veut (pour calculer la MM10)
    const startMinus10Periods = start - TimeFrame.toMilliseconds(TimeFrame.t1h) * 10;
    const ohlcvs = await this.exchange.fetchRange(this.symbol, TimeFrame.t1h, startMinus10Periods, end);

    const strategy = new MA10Strategy();
    ticks.forEach(tick => this.onTick(strategy, ohlcvs, tick));
  }

  onTick = (strategy: MA10Strategy, ohlcvs: Ohlcv[], tick: Ohlcv): void => {
    // remplacer dans ohlcvs par la valeur du tick (close)
    const index = findLastIndex(ohlcvs, x => x.timestamp <= tick.timestamp);
    const ohlcvsAtTick = ohlcvs.slice(0, index + 1);
    ohlcvsAtTick[index].close = tick.close;

    strategy.execute(ohlcvsAtTick);
  }
}
