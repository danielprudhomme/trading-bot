import ExchangeId from '../enums/exchange-id';
import AssetSymbol from './asset-symbol';

export default class Ticker {
  asset: AssetSymbol;
  base: AssetSymbol;
  exchangeId: ExchangeId;

  constructor(asset: AssetSymbol, base: AssetSymbol, exchangeId: ExchangeId) {
    this.asset = asset;
    this.base = base;
    this.exchangeId = exchangeId;
  }

  toString = (): string => `${this.asset}/${this.base}`;
}