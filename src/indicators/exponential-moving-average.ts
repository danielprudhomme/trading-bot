export default class ExponentialMovingAverage {
  static calculate(values: number[], length: number): number[] {
    const alpha = 2 / (length + 1)

    const emas = values.reduce(
      (emas, value, i) => {
        if (i == 0) {
          emas.push(value);
        } else {
          emas.push(alpha * value + (1 - alpha) * emas[emas.length - 1]);
        }
        return emas;
      },
      [] as number[]
    );
    
    return emas;
  }
}