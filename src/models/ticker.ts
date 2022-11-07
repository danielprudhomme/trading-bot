import ExchangeId from '../enums/exchange-id';
import AssetSymbol from './asset-symbol';

export default interface Ticker {
  asset: AssetSymbol;
  base: AssetSymbol;
  exchangeId: ExchangeId;
}