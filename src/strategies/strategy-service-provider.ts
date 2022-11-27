import BaseStrategyService from './base-strategy.service';
import LowOutsideBBService from './low-outside-bb.service';
import LowOutsideBBStrategy from './low-outside-bb.strategy';
import Strategy from './strategy';

export default class StrategyServiceProvider {
  static get(strategy: Strategy): BaseStrategyService {
    switch (strategy.type) {
      case 'low-outside-bb':
        return new LowOutsideBBService(strategy as LowOutsideBBStrategy);
      default:
        throw new Error(`Strategy service not found for type : ${strategy.type}`);
    }
  }
}