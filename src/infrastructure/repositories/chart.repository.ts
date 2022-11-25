import Chart from '../../models/chart';

export default abstract class ChartRepository {
  abstract getAll(): Promise<Chart[]>;
  abstract updateMultiple(charts: Chart[]): Promise<void>;
}