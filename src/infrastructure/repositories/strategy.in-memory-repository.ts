import Strategy from '../../strategies/strategy';
import StrategyRepository from './strategy.repository';

export default class StrategyInMemoryRepository extends StrategyRepository {
  private _strategies = new Map<string, Strategy>();

  getAll = async (): Promise<Strategy[]> => Array.from(this._strategies.values()).map(this.mapToDomainObject);

  addOrUpdate = async (strategy: Strategy): Promise<void> => { this.setStrategy(strategy); }

  async updateMultiple(strategies: Strategy[]): Promise<void> {
    if (strategies.length === 0) return;
    strategies.forEach(strategy => {
      const entity = this.mapToDatabaseEntity(strategy);
      this.setStrategy(entity);
    });
  }

  private setStrategy = (strategy: Strategy) => this._strategies.set(strategy.id, strategy);
}