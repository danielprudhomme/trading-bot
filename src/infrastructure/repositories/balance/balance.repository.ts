import { ExchangeId } from '../../../enums/exchange-id';
import Balance from '../../../models/balance';

export default abstract class BalanceRepository {
  abstract get(exchangeId: ExchangeId): Promise<Balance | undefined>;
  abstract addOrUpdate(balance: Balance): Promise<void>;
}