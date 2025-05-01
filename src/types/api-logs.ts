
export interface ApiLog {
  id: string;
  api: string;
  endpoint: string;
  status: string;
  response_time: number;
  details: any;
  created_at: string;
}
