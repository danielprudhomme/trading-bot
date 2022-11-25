import Strategy from './strategy';
import StrategyPerformerService from './strategy-performer.service';

export default class StrategyPerformerProvider {
  static get(strategy: Strategy): StrategyPerformerService {
    
  }
}