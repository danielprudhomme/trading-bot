
export default class Wallet {
  baseCurrency: string = 'BUSD';
  asset: string = 'BTC';
  availableAmount: number;

  constructor(initialAvailableAmount: number) {
    this.availableAmount = initialAvailableAmount;
  }

  
}