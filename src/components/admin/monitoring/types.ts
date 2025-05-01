
export interface ApiStats {
  total: number;
  success: number;
  failed: number;
  avgResponseTime: number;
  lastSync?: string;
}

export interface ChartData {
  date: string;
  calls: number;
  successRate: number;
  avgTime: number;
}
