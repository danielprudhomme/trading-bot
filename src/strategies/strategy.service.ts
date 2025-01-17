import StrategyRepository from '../infrastructure/repositories/strategy/strategy.repository';
import Strategy from './strategy';

export default class StrategyService {
  private strategyRepository: StrategyRepository;

  constructor(
    strategyRepository: StrategyRepository,
  ) {
    this.strategyRepository = strategyRepository;
  }

  getAll = async (): Promise<Strategy[]> => await this.strategyRepository.getAll();
}