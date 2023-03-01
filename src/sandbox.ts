import { ConfigurationManager } from './config/configuration-manager';
import ExchangeService from './infrastructure/exchange-service/exchange.service';
import Workspace from './workspace/workspace';

ConfigurationManager.load();
Workspace.init(true, true);

const exchangeService = new ExchangeService('binance');

const b = await exchangeService.fetchFreeBalance();

console.log('done', b);