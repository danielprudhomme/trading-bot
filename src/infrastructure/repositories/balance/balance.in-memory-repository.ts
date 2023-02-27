import { ExchangeId } from '../../../enums/exchange-id';
import Balance from '../../../models/balance';
import BalanceRepository from './balance.repository';

export default class BalanceInMemoryRepository extends BalanceRepository {
  private _balances = new Map<ExchangeId, Balance>();

  async get(exchangeId: ExchangeId): Promise<Balance | undefined> {
    return this._balances.get(exchangeId);
  }

  async addOrUpdate(balance: Balance): Promise<void> {
    this._balances.set(balance.exchangeId, balance);
  }
}