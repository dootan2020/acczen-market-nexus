
export interface ApiLogInsert {
  api: string;
  endpoint: string;
  status: string;
  response_time?: number;
  details?: any;
}
