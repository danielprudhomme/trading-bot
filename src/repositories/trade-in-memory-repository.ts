import { Guid } from 'guid-typescript';
import Trade from '../models/trade';
import TradeRepository from './trade-repository';

export default class TradeInMemoryRepository extends TradeRepository {
  private _trades = new Map<Guid, Trade>();

  getById = async (id: Guid): Promise<Trade | null> => this._trades.get(id) ?? null;

  getAll = async (): Promise<Trade[]> => Array.from(this._trades.values());

  getAllOpen = async (): Promise<Trade[]> => (await this.getAll()).filter(trade => trade.isOpen);

  async set(trade: Trade): Promise<void> {
    this._trades.set(trade.id, trade);
  }
}