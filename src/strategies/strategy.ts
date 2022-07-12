import Ohlcv from "../models/ohlcv";

export default interface Strategy {
  execute(timestamp: number, ohlcvs: Ohlcv[]): void;
}