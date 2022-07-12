export default class MovingAverage {
  // Calculate MA for the last value of the array values
  static calculate(length: number, values: number[]): number {
    const sum = values.slice(-length).reduce((a, b) => a + b, 0);
    const avg = (sum / length) || 0;
    return avg;
  }
}