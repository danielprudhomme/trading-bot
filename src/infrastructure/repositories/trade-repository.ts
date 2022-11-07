import { Guid } from 'guid-typescript';
import Trade from '../../models/trade';

export default class TradeRepository {

  async getById(id: Guid): Promise<Trade | null> {
    throw new Error('Not implemented');
  }

  async getAllOpen(): Promise<Trade[]> {
    throw new Error('Not implemented');
  }

  async getAll(): Promise<Trade[]> {
    throw new Error('Not implemented');
  }

  async set(trade: Trade): Promise<void> {
    throw new Error('Not implemented');
  }
}