import Fee from './fee';

export default interface ExchangeOrder {
  id: string;
  timestamp: number;
  status: 'open' | 'closed' | 'canceled';
  executedPrice?: number;
  fee?: Fee;
}