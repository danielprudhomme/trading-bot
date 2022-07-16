import { OrderSide } from '../enums/order-side';

export default class ExchangeWallet {
  marketOrder(symbol: string, side: OrderSide, amount: number) {

  }

  // simplified version with only one asset
  get balance(): { asset: number, usd: number } {
      return { asset: 0, usd: 1000 };
  }
}