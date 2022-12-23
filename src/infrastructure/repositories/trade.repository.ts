import Trade from '../../models/trade';

export default abstract class TradeRepository {
  abstract getAll(): Promise<Trade[]>;
  abstract getAllOpen(): Promise<Trade[]>;
  abstract insert(trade: Trade): Promise<void>;
  abstract updateMultiple(trades: Trade[]): Promise<void>;
  abstract deleteAll(): Promise<void>;

  protected mapToDatabaseEntity = (trade: Trade): Trade => {
    const entity = { ...trade };
    delete entity.updated;
    return entity;
  }

  protected mapToDomainObject = (entity: Trade): Trade => ({ ...entity, updated: false });
}