import { ConfigurationManager } from './config/configuration-manager';
import IndicatorHelper from './indicators/indicator.helper';
import { rma } from './indicators/rsi/rsi';
import { trueTrange } from './indicators/supertrend/supertrend';
import Workspace from './workspace/workspace';

ConfigurationManager.load();
Workspace.init(true, true);

const i = rma(100, trueTrange);
console.log('to string', IndicatorHelper.toString(i));