import Strategy from '../../strategies/strategy';

export default abstract class StrategyRepository {
  abstract getAll(): Promise<Strategy[]>;
  abstract addOrUpdate(strategy: Strategy): Promise<void>;
  abstract updateMultiple(strategies: Strategy[]): Promise<void>;
  
  protected mapToDatabaseEntity = (strategy: Strategy): Strategy => {
    const entity = { ...strategy };
    delete entity.updated;
    return entity;
  }

  protected mapToDomainObject = (entity: Strategy): Strategy => ({ ...entity, updated: false });
}