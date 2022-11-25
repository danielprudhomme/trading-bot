import Trade from '../models/trade';
import Strategy from './strategy';

export default abstract class StrategyPerformerService {
  strategy: Strategy;

  constructor(strategy: Strategy) {
    this.strategy = strategy;
  }

  abstract execute(trades: Trade[]): Promise<void>;
}