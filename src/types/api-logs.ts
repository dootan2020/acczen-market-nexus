
export interface ApiLog {
  id: string;
  created_at: string;
  api: string;
  endpoint: string;
  status: string;
  response_time: number;
  details: Record<string, any>;
}

export interface ApiLogInsert {
  api: string;
  endpoint: string;
  status: string;
  response_time: number;
  details: Record<string, any>;
}
