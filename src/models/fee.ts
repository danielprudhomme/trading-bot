import { AssetSymbol } from './asset-symbol';

export default interface Fee {
  asset: AssetSymbol;
  amount: number;
}