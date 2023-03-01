import ChartService from '../services/chart.service';
import OrderService from '../services/order.service';
import StopLossService from '../services/stop-loss.service';
import TradeService from '../services/trade.service';
import StrategyService from '../strategies/strategy.service';
import RepositoryProvider from './repository.provider';

export default class ServiceProvider {
  private _tradeService: TradeService;
  private _strategyService: StrategyService;
  private _chartService: ChartService;
  
  constructor(repository: RepositoryProvider) {
    const orderService = new OrderService();
    const stopLossService = new StopLossService(orderService);
    this._tradeService = new TradeService(orderService, stopLossService, repository.trade);
    this._strategyService = new StrategyService(repository.strategy);
    this._chartService = new ChartService(repository.chart);
  }

  get trade(): TradeService {
    return this._tradeService;
  }

  get strategy(): StrategyService {
    return this._strategyService;
  }

  get chart(): ChartService {
    return this._chartService;
  }
}