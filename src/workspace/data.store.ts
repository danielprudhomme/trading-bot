import Balance from '../models/balance';
import Trade from '../models/trade';
import Strategy from '../strategies/strategy';

export default class DataStore {
  trades: Trade[] = [];
  balances: Balance[] = [];
  strategies: Strategy[] = [];
}