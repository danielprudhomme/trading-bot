import Strategy from '../../models/strategy';

export default abstract class StrategyRepository {
  abstract getAll(): Promise<Strategy[]>;
  abstract update(strategy: Strategy): Promise<void>;
}