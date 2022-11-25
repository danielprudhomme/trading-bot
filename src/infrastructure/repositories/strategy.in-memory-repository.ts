import Strategy from '../../strategies/strategy';
import StrategyRepository from './strategy.repository';

export default class StrategyInMemoryRepository extends StrategyRepository {
  private _strategies = new Map<string, Strategy>();

  getAll = async (): Promise<Strategy[]> => Array.from(this._strategies.values());

  async update(strategy: Strategy): Promise<void> {
    this._strategies.set(strategy.id, strategy);
  }
}