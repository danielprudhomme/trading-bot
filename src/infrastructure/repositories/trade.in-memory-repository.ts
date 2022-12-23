import { Guid } from 'guid-typescript';
import Trade from '../../models/trade';
import TradeRepository from './trade.repository';

export default class TradeInMemoryRepository extends TradeRepository {
  private _trades = new Map<string, Trade>();

  getAll = async (): Promise<Trade[]> => Array.from(this._trades.values()).map(this.mapToDomainObject)

  getAllOpen = async (): Promise<Trade[]> => (await this.getAll())
    .filter(trade => trade.isOpen);

  async insert(trade: Trade): Promise<void> {
    const id = Guid.create().toString();
    const entity = this.mapToDatabaseEntity(trade);
    this._trades.set(id, entity);
  }

  async updateMultiple(trades: Trade[]): Promise<void> {
    if (trades.length === 0) return;
    trades.forEach(trade => {
      const entity = this.mapToDatabaseEntity(trade);
      this._trades.set(entity.id, entity);
    });
  }

  async deleteAll(): Promise<void> {
    this._trades = new Map<string, Trade>();
  }
}