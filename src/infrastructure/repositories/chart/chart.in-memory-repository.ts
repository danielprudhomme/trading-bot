import Chart from '../../../models/chart';
import ChartRepository from './chart.repository';

export default class ChartInMemoryRepository extends ChartRepository {
  private _charts = new Map<string, Chart>();

  getAll = async (): Promise<Chart[]> => Array.from(this._charts.values());

  async updateMultiple(charts: Chart[]): Promise<void> {
    if (charts.length === 0) return;
    charts.forEach(chart => {
      this._charts.set(chart.id, chart);
    });
  }
}