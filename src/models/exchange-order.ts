
export default interface ExchangeOrder {
  id: string;
  timestamp: number;
  status: 'open' | 'closed' | 'canceled';
  executedPrice?: number;
}