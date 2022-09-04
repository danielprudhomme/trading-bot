export class OrderSide {
  static readonly Buy = 'buy';
  static readonly Sell = 'sell';
  
  static getOpposite = (side: OrderSide): OrderSide => side == OrderSide.Buy ? OrderSide.Sell : OrderSide.Buy;
}