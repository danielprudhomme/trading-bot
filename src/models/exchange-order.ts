import { AssetSymbol } from './asset-symbol';

export default interface ExchangeOrder {
  id: string;
  timestamp: number;
  status: 'open' | 'closed' | 'canceled';
  executedPrice?: number;
  fee?: { asset: AssetSymbol; amount: number };
}