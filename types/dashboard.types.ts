export interface ModuleStats {
  id: string;
  title: string;
  color: string;
  stats: Record<string, string | number>;
  chartData?: ChartData;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie';
  data: Array<Record<string, string | number>>;
}

export interface DashboardData {
  userName: string;
  modules: ModuleStats[];
}
