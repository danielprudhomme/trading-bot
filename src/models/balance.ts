import { ExchangeId } from '../enums/exchange-id';
import { AssetSymbol } from './asset-symbol';

export default interface Balance {
  exchangeId: ExchangeId;
  balances: { asset: AssetSymbol, amount: number }[];
}