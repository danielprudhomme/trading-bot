import Fee from '../models/fee';

export default interface TradePerformance {
  pnl: number;
  pnlPercent: number;
  fee: Fee;
  openTimestamp: number;
  closeTimestamp: number;
}