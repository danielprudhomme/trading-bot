import ExchangeService from "../exchange-service/exchange.service";

export default class Wallet {
  exchangeService: ExchangeService;
  baseCurrency: string = 'BUSD';
  asset: string = 'BTC';
  availableAmount: number;

  constructor(exchangeService: ExchangeService, initialAvailableAmount: number) {
    this.exchangeService = exchangeService;
    this.availableAmount = initialAvailableAmount;
  }

  
}