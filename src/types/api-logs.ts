
// API log types
export interface ApiLogEntry {
  id: string;
  api: string;
  endpoint: string;
  status: string;
  response_time?: number;
  details: any;
  created_at: string;
}

export interface ApiLogInsert {
  api: string;
  endpoint: string;
  status: string;
  response_time?: number;
  details?: any;
}
