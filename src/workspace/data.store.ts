import Trade from '../models/trade';
import Strategy from '../strategies/strategy';

export default class DataStore {
  trades: Trade[] = [];
  strategies: Strategy[] = [];
}