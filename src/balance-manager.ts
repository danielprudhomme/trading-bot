import { ExchangeId } from './enums/exchange-id';
import { AssetSymbol } from './models/asset-symbol';
import Workspace from './workspace/workspace';

export default abstract class BalanceManager {
  static async getFreeBalance(exchangeId: ExchangeId, asset: AssetSymbol): Promise<number> {
    // Get balance from DB
    let exchangeBalance = await Workspace.repository.balance.get(exchangeId);

    if (!exchangeBalance || exchangeBalance.balances.findIndex(b => b.asset === asset) === -1) {
      // If balance not found, get it from exchange, and push to DB
      const balances = await Workspace.getExchange(exchangeId).fetchFreeBalance();
      if (!exchangeBalance) {
        exchangeBalance = { exchangeId, balances: [] };
      }
      exchangeBalance.balances = balances;
      await Workspace.repository.balance.addOrUpdate(exchangeBalance);
    }

    const balance = exchangeBalance.balances.find(b => b.asset === asset);
    return balance ? balance.amount : 0;
  }

  static async updateBalance(exchangeId: ExchangeId, pnl: number) {
    // const exchangeBalance = await Workspace.balanceRepository.get(exchangeId);
    
    // if (!exchangeBalance) return;


    // // await Workspace.balanceRepository.addOrUpdate()

  }
  
}