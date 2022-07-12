import MovingAverage from './moving-average';

export default class RelativeStrenghIndex {
  // Calculate RSI for the last value of the array values
  // TODO : vérifier que c'est bien calculé (ça a l'air approximatif mais suffisant pour l'utilisation)
  static calculate(values: number[], length: number = 14): number {
    const upValues = values.map((value, i, arr) => i == 0 ? 0 : Math.max(value - arr[i - 1], 0));
    const downValues = values.map((value, i, arr) => i == 0 ? 0 : -Math.min(value - arr[i - 1], 0));

    const upRsiMa = RelativeStrenghIndex.rsiMovingAverageCalculate(length, upValues);
    const downRsiMa = RelativeStrenghIndex.rsiMovingAverageCalculate(length, downValues);

    const up = upRsiMa[upRsiMa.length - 1];
    const down = downRsiMa[downRsiMa.length - 1];

    const rsi = down == 0 ? 100 : up == 0 ? 0 : 100 - (100 / (1 + up / down));
    return rsi;
  }

  private static rsiMovingAverageCalculate(length: number, values: number[]): number[] {
    const alpha = 1 / length;

    const valuesForMAFirstElement = values.slice(-2 * length + 1, -length + 1);
    const firstValue = MovingAverage.calculate(length, valuesForMAFirstElement);
    const result = [firstValue];

    const index = values.length - length + 1;
    for (let i = index; i < values.length; i++) {
      const rsiMaVal = alpha * values[i] + (1 - alpha) * result[result.length - 1];
      result.push(rsiMaVal);
    }
 
    return result;
  }
}