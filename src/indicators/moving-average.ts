import Ohlcv from "../models/ohlcv";

export default class MovingAverage {
  static calculate(length: number, values: Ohlcv[]): number {
    const sum = values.slice(-length).map(x => x.close).reduce((a, b) => a + b, 0);
    const avg = (sum / length) || 0;
    return avg;
  }
}