import Indicator from './indicator';
import { IndicatorService } from './indicator.service';
import { Ema } from './moving-average/ema';
import EmaService from './moving-average/ema.service';
import { Sma } from './moving-average/sma';
import SmaService from './moving-average/sma.service';
import { Rsi, RsiDown, RsiRma, RsiUp } from './rsi/rsi';
import RsiDownService from './rsi/rsi-down.service';
import RsiRmaService from './rsi/rsi-rma.service';
import RsiUpService from './rsi/rsi-up.service';
import RsiService from './rsi/rsi.service';

export default class IndicatorServiceProvider {
  static get(indicator: Indicator): IndicatorService {
    switch (indicator.type) {
      case 'sma':
        return new SmaService(indicator as Sma);
      case 'ema':
          return new EmaService(indicator as Ema);
      case 'rsi':
        return new RsiService(indicator as Rsi);
      case 'rsiUp':
        return new RsiUpService(indicator as RsiUp);
      case 'rsiDown':
        return new RsiDownService(indicator as RsiDown);
      case 'rsiRma':
        return new RsiRmaService(indicator as RsiRma);
      default:
        throw new Error(`Indicator service not found for id : ${indicator}`);
    }
  }
}