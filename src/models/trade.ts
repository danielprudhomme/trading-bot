import Ticker from '../models/ticker';
import Order from './order';
import { StopLossMoveCondition } from './stop-loss-move-condition';

export default interface Trade {
  id: string;
  ticker: Ticker;
  isOpen: boolean;
  orders: Order[];
  stopLossMoveCondition?: StopLossMoveCondition;
  updated?: boolean;
}
