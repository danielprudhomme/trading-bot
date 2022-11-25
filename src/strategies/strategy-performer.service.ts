import Strategy from '../models/strategy';
import Trade from '../models/trade';

export default abstract class StrategyPerformerService {
  strategy: Strategy;

  constructor(strategy: Strategy) {
    this.strategy = strategy;
  }

  abstract execute(trades: Trade[]): Promise<void>;
}