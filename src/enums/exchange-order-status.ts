export class ExchangeOrderStatus {
  static readonly Open = 'open';
  static readonly Closed = 'closed';
  static readonly Canceled = 'canceled';

  static fromCcxtOrderStatus(status: 'open' | 'closed' | 'canceled') {
    switch(status) {
      case 'open':
        return ExchangeOrderStatus.Open;
      case 'closed':
        return ExchangeOrderStatus.Closed;
      case 'canceled':
        return ExchangeOrderStatus.Canceled;
    }
  }
}