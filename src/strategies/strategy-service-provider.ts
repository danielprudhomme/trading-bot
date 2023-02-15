import BaseStrategyService from './base-strategy.service';
import BBWideningLongService from './bb-widening-long.service';
import BBWideningLongStrategy from './bb-widening-long.strategy';
import LowOutsideBBService from './low-outside-bb.service';
import LowOutsideBBStrategy from './low-outside-bb.strategy';
import Strategy from './strategy';

export default class StrategyServiceProvider {
  static get(strategy: Strategy): BaseStrategyService {
    switch (strategy.type) {
      case 'low-outside-bb':
        return new LowOutsideBBService(strategy as LowOutsideBBStrategy);
      case 'bb-widening-long':
        return new BBWideningLongService(strategy as BBWideningLongStrategy);
      default:
        throw new Error(`Strategy service not found for type : ${strategy.type}`);
    }
  }
}