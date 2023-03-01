import firebase from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { ConfigurationManager } from '../config/configuration-manager';
import BalanceInMemoryRepository from '../infrastructure/repositories/balance/balance.in-memory-repository';
import BalanceRepository from '../infrastructure/repositories/balance/balance.repository';
import ChartInMemoryRepository from '../infrastructure/repositories/chart/chart.in-memory-repository';
import ChartRepository from '../infrastructure/repositories/chart/chart.repository';
import StrategyInMemoryRepository from '../infrastructure/repositories/strategy/strategy.in-memory-repository';
import StrategyRepository from '../infrastructure/repositories/strategy/strategy.repository';
import TradeFirebaseRepository from '../infrastructure/repositories/trade/trade.firebase-repository';
import TradeInMemoryRepository from '../infrastructure/repositories/trade/trade.in-memory-repository';
import TradeRepository from '../infrastructure/repositories/trade/trade.repository';

export default class RepositoryProvider {
  private _tradeRepository: TradeRepository;
  private _strategyRepository: StrategyRepository;
  private _chartRepository: ChartRepository;
  private _balanceRepository: BalanceRepository;

  constructor(inMemoryDatabase: boolean = false) {
    if (inMemoryDatabase) {
      this._tradeRepository = new TradeInMemoryRepository();
      this._strategyRepository = new StrategyInMemoryRepository();
      this._chartRepository = new ChartInMemoryRepository();
      this._balanceRepository = new BalanceInMemoryRepository();
    }
    else {
      firebase.initializeApp({
        credential: firebase.credential.cert(ConfigurationManager.getFirebaseServiceAccount()),
      });
      const firestore = getFirestore();
      firestore.settings({ ignoreUndefinedProperties: true });

      this._tradeRepository = new TradeFirebaseRepository(firestore);
      throw new Error('Repositories implementations needed !')
    }
  }
  
  public get chart(): ChartRepository {
    return this._chartRepository;
  }

  get strategy(): StrategyRepository {
    return this._strategyRepository;
  }

  get trade(): TradeRepository {
    return this._tradeRepository;
  }

  get balance(): BalanceRepository {
    return this._balanceRepository;
  }
}