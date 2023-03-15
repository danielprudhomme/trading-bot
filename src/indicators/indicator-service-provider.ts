import BollingerBands from './bollinger-bands/bollinger-bands';
import BollingerBandsService from './bollinger-bands/bollinger-bands.service';
import StandardDeviation from './bollinger-bands/standard-deviation';
import StandardDeviationService from './bollinger-bands/standard-deviation.service';
import Indicator from './indicator';
import { IndicatorService } from './indicator.service';
import Dema from './macd-zero-lag/dema';
import DemaService from './macd-zero-lag/dema.service';
import MacdZeroLag from './macd-zero-lag/macd-zero-lag';
import MacdZeroLagService from './macd-zero-lag/macd-zero-lag.service';
import { Ema } from './moving-average/ema';
import EmaService from './moving-average/ema.service';
import { Rma } from './moving-average/rma';
import RmaService from './moving-average/rma.service';
import { Sma } from './moving-average/sma';
import SmaService from './moving-average/sma.service';
import { Rsi } from './rsi/rsi';
import RsiService from './rsi/rsi.service';
import { Supertrend } from './supertrend/supertrend';
import SupertrendService from './supertrend/supertrend.service';

export default class IndicatorServiceProvider {
  static get(indicator: Indicator): IndicatorService {
    switch (indicator.type) {
      case 'sma':
        return new SmaService(indicator as Sma);
      case 'ema':
        return new EmaService(indicator as Ema);
      case 'rma':
        return new RmaService(indicator as Rma);
      case 'rsi':
        return new RsiService(indicator as Rsi);
      case 'bb':
        return new BollingerBandsService(indicator as BollingerBands);
      case 'stdev':
        return new StandardDeviationService(indicator as StandardDeviation);
      case 'macd-zero-lag':
        return new MacdZeroLagService(indicator as MacdZeroLag);
      case 'dema':
        return new DemaService(indicator as Dema);
      case 'supertrend':
        return new SupertrendService(indicator as Supertrend);
      default:
        throw new Error(`Indicator service not found for type : ${indicator.type}`);
    }
  }
}